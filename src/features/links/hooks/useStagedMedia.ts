import * as ImagePicker from 'expo-image-picker';
import { useCallback, useState } from 'react';
import {
  createLinkPost,
  deleteLinkPost,
} from '../../../lib/supabase/queries/linkPosts';
import { links as linksStorage } from '../../../lib/supabase/storage/links';
import {
  createLinkPostMedia,
  deleteLinkPostMedia,
} from '../../../lib/supabase/queries/linkPostMedia';
import { trackEvent } from '../../../lib/telemetry/analytics';
import { compressImage } from '../../../lib/media/compress';
import {
  generateImageThumbnail,
  generateVideoThumbnail,
} from '../../../lib/media/thumbnail';
import { logger } from '../../../lib/telemetry/logger';
import { useInvalidate } from '../../../lib/supabase/hooks/useInvalidate';

type UseStagedMediaOpts = {
  linkId: string;
  partyId: string;
  userId: string;
  onError?: (error: unknown) => void;
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

export function useStagedMedia({
  linkId,
  partyId,
  userId,
  onError,
}: UseStagedMediaOpts) {
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
      } catch (error) {
        setStagedAssets((prev) =>
          prev.map((p) =>
            p.id === item.id ? { ...p, thumbnailStatus: 'failed' } : p,
          ),
        );
        logger.error('Error generating asset thumbnail:', error.message);
      }
    });
  }, []);

  const addFromGallery = useCallback(async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      onError?.(new Error('Permission to access photo library was denied'));
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

  const addFromCamera = useCallback(async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      onError?.(new Error('Permission to access camera was denied'));
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images', 'videos'],
      exif: false,
    });

    if (!result.canceled && result.assets.length > 0) {
      stageAssets(result.assets);
    }
  }, [stageAssets]);

  const removeAsset = useCallback((uri: string) => {
    setStagedAssets((prev) => prev.filter((item) => item.asset.uri !== uri));
  }, []);

  const clearAll = useCallback(() => {
    setStagedAssets([]);
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

          const uri =
            type === 'video'
              ? item.asset.uri
              : (await compressImage(item.asset.uri)).uri;
          const path = await linksStorage.upload(linkId, post.id, uri, mime);

          let thumbnailPath: string | null = null;
          try {
            thumbnailPath = await linksStorage.upload(
              linkId,
              post.id,
              item.thumbnailUri,
              'image/jpeg',
            );
          } catch (error) {
            logger.error('Error uploading asset thumbnail:', error.message);
          }

          setProgress((prev) =>
            prev ? { ...prev, completed: prev.completed + 1 } : null,
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
        .filter(
          (r): r is PromiseFulfilledResult<UploadedAsset> =>
            r.status === 'fulfilled',
        )
        .map((r) => r.value);
      const failures = uploadedResults.length - successes.length;

      for (const item of successes) uploadedPaths.push(item.path);

      if (successes.length === 0) {
        await deleteLinkPost(post.id);
        throw new Error(`All uploads failed, post was not created.`);
      }

      await Promise.all(
        successes.map(async (m) => {
          const row = await createLinkPostMedia({
            post_id: post.id,
            path: m.path,
            thumbnail_path: m.thumbnailPath,
            mime: m.mime,
            type: m.type,
            duration_seconds: m.duration_seconds,
          });
          if (row) insertedMediaIds.push(row.id);
        }),
      );

      invalidate.linkDetail(linkId);
      invalidate.partyDetail(partyId);
      invalidate.activity();

      if (failures > 0) {
        setProgress((prev) => (prev ? { ...prev, failed: failures } : null));
        onError?.(new Error(`${failures} upload(s) failed`));
      }

      trackEvent('media_uploaded', {
        link_id: linkId,
        count: successes.length,
      });
      setStagedAssets([]);
    } catch (err) {
      if (insertedMediaIds.length) {
        await Promise.all(
          insertedMediaIds.map((id) => deleteLinkPostMedia(id)),
        );
      }
      if (uploadedPaths.length) {
        await linksStorage.remove(uploadedPaths);
      }
      trackEvent('media_upload_failed', { link_id: linkId });
      logger.error('Error uploading staged media', { err });
      onError?.(err);
    } finally {
      setUploading(false);
      setProgress(null);
    }
  }, [stagedAssets, linkId, userId, invalidate, onError]);

  return {
    stagedAssets,
    stageAssets,
    addFromGallery,
    addFromCamera,
    removeAsset,
    clearAll,
    uploadAll,
    uploading,
    progress,
    hasAssets: stagedAssets.length > 0,
  };
}
