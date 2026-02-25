import * as ImagePicker from 'expo-image-picker';
import * as Burnt from 'burnt';
import { useDialog } from '../../../providers/DialogProvider';
import { useInvalidate } from '../../../lib/supabase/hooks/useInvalidate';
import { useCallback, useState } from 'react';
import {
  generateImageThumbnail,
  generateVideoThumbnail,
} from '../../../lib/media/thumbnail';
import { logger } from '../../../lib/telemetry/logger';
import {
  createLinkPost,
  deleteLinkPost,
} from '../../../lib/supabase/queries/linkPosts';
import { compressImage } from '../../../lib/media/compress';
import { links as linksStorage } from '../../../lib/supabase/storage/links';
import {
  createLinkPostMedia,
  deleteLinkPostMedia,
} from '../../../lib/supabase/queries/linkPostMedia';
import { trackEvent } from '../../../lib/telemetry/analytics';

type UseStagedMediaActionsParams = {
  linkId: string;
  partyId: string;
  userId: string;
};

export type StagedAsset = {
  id: string;
  asset: ImagePicker.ImagePickerAsset;
  thumbnailUri: string | null;
  thumbnailStatus: 'ready' | 'generating' | 'failed';
};

type UploadProgress = {
  total: number;
  completed: number;
  failed: number;
};

type UploadedAsset = {
  path: string;
  thumbnailPath: string | null;
  mime: string;
  type: 'image' | 'video';
  duration_seconds: number | null;
};
export function useStagedMediaActions({
  linkId,
  partyId,
  userId,
}: UseStagedMediaActionsParams) {
  const dialog = useDialog();
  const invalidate = useInvalidate();

  const [stagedAssets, setStagedAssets] = useState<StagedAsset[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress | null>(null);

  const stageAssets = useCallback((assets: ImagePicker.ImagePickerAsset[]) => {
    const incoming: StagedAsset[] = assets.map((asset) => {
      const id = `${asset.uri}-${Date.now()}-${Math.random()}`;
      const isVideo = asset.type === 'video';
      return {
        id,
        asset,
        thumbnailUri: isVideo ? null : asset.uri,
        thumbnailStatus: 'generating',
      };
    });

    setStagedAssets((prev) => [...prev, ...incoming]);

    incoming.map(async (item) => {
      try {
        let thumbnailUri =
          item.asset.type === 'video'
            ? await generateVideoThumbnail(item.asset.uri)
            : await generateImageThumbnail(item.asset.uri);
        setStagedAssets((prev) =>
          prev.map((p) =>
            p.id === item.id
              ? { ...p, thumbnailUri, thumbnailStatus: 'ready' }
              : p,
          ),
        );
      } catch (err) {
        setStagedAssets((prev) =>
          prev.map((p) =>
            p.id === item.id ? { ...p, thumbnailStatus: 'failed' } : p,
          ),
        );
        logger.warn('Error generating asset thumbnail:', { err, item });
      }
    });

    const failedThumbnails = incoming.filter(
      (item) => item.thumbnailStatus === 'failed',
    ).length;
    if (failedThumbnails) {
      Burnt.toast({
        title: `Failed to generate ${failedThumbnails} ${failedThumbnails === 1 ? 'thumbnail' : 'thumbnails'}`,
        preset: 'error',
        haptic: 'warning',
      });
    }
  }, []);

  const addFromGallery = useCallback(async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      await dialog.error(
        'Permission Needed',
        'Please enable media library permissions to continue.',
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      allowsMultipleSelection: true,
      exif: false,
    });

    if (!result.canceled && result.assets.length > 0) {
      stageAssets(result.assets);
    }
  }, [stageAssets]);

  const removeAsset = useCallback((uri: string) => {
    setStagedAssets((prev) => prev.filter((item) => item.asset.uri !== uri));
  }, []);

  const clearAll = useCallback(async () => {
    const confirmed = await dialog.confirmAsk(
      'Clear All',
      'Are you sure you want to clear all your items?',
    );

    if (confirmed) setStagedAssets([]);
  }, []);

  const uploadAll = useCallback(async () => {
    if (stagedAssets.length === 0) return;

    setUploading(true);
    setProgress({ total: stagedAssets.length, completed: 0, failed: 0 });

    const insertedMediaIds = [];
    const uploadedPaths = [];

    try {
      const post = await createLinkPost({ link_id: linkId, owner_id: userId });

      const uploadedResults = await Promise.allSettled(
        stagedAssets.map(async (item): Promise<UploadedAsset> => {
          const mime = item.asset.mimeType ?? 'image/jpeg';
          const type = item.asset.type === 'video' ? 'video' : 'image';

          let path,
            thumbnailPath = null;

          try {
            const uri =
              type === 'video'
                ? item.asset.uri
                : (await compressImage(item.asset.uri)).uri;
            path = await linksStorage.upload(linkId, post.id, uri, mime);

            if (item.thumbnailUri) {
              try {
                thumbnailPath = await linksStorage.upload(
                  linkId,
                  post.id,
                  item.thumbnailUri,
                  'image/jpeg',
                );
              } catch (err) {
                logger.warn('Error uploading asset thumbnail', { err });
              }
            }
          } catch (err) {
            logger.error('Error uploading asset', { err, asset: item });
            setProgress((prev) =>
              prev ? { ...prev, failed: prev.failed + 1 } : prev,
            );
          }

          setProgress((prev) =>
            prev ? { ...prev, completed: prev.completed + 1 } : prev,
          );
          return {
            path,
            thumbnailPath,
            mime,
            type,
            duration_seconds:
              type === 'video' ? (item.asset.duration ?? null) : null,
          };
        }),
      );

      const successes = uploadedResults
        .filter((res) => res.status === 'fulfilled')
        .map((res) => res.value);
      const failures = uploadedResults.length - successes.length;

      for (const item of successes) uploadedPaths.push(item.path);

      if (successes.length === 0) {
        try {
          await deleteLinkPost(post.id);
        } catch (err) {
          logger.error('Cleanup failed: Error deleting link post', {
            err,
            uploadedResults,
          });
        }
        throw new Error('All uploads failed, post was not created.');
      }

      await Promise.all(
        successes.map(async (m) => {
          try {
            const row = await createLinkPostMedia({
              post_id: post.id,
              path: m.path,
              thumbnail_path: m.thumbnailPath,
              mime: m.mime,
              type: m.type,
              duration_seconds: m.duration_seconds,
            });
            if (row) insertedMediaIds.push(row.id);
          } catch (err) {
            logger.error('Error creating link post media', { err, media: m });
          }
        }),
      );

      if (failures > 0) {
        Burnt.toast({
          title: `${failures} ${failures === 1 ? 'item' : 'items'} failed to upload`,
          preset: 'error',
          haptic: 'error',
        });
      } else {
        Burnt.toast({
          title: `${successes.length} ${successes.length === 1 ? 'item' : 'items'} posted.`,
          preset: 'done',
          haptic: 'success',
        });

        trackEvent('media_uploaded', {
          link_id: linkId,
          count: successes.length,
        });
        invalidate.linkDetail(linkId);
        invalidate.partyDetail(partyId);
        invalidate.activity();
        setStagedAssets([]);
      }
    } catch (err) {
      const originalErr = err;

      if (insertedMediaIds.length) {
        try {
          await Promise.all(
            insertedMediaIds.map((id) => deleteLinkPostMedia(id)),
          );
        } catch (cleanupErr) {
          logger.error('Cleanup failed: Error deleting link post media', {
            err: cleanupErr,
            insertedMediaIds,
            linkId,
          });
        }
      }

      if (uploadedPaths.length) {
        try {
          await linksStorage.remove(uploadedPaths);
        } catch (cleanupErr) {
          logger.error(
            'Cleanup failed: Error removing uploaded sotrage paths',
            { err: cleanupErr, uploadedPaths, linkId },
          );
        }
      }

      trackEvent('media_upload_failed', {
        link_id: linkId,
        count: stagedAssets.length,
      });
      logger.error('Error uploading staged media', {
        err: originalErr,
        linkId,
        stagedAssets,
      });
      await dialog.error('Failed to Upload Items');
    } finally {
      setUploading(false);
      setProgress(null);
    }
  }, [stagedAssets, linkId, userId, invalidate]);

  return {
    stagedAssets,
    stageAssets,
    addFromGallery,
    removeAsset,
    clearAll,
    uploadAll,
    uploading,
    progress,
    hasAssets: stagedAssets.length > 0,
  };
}
