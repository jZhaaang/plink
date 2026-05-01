import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import * as Burnt from 'burnt';
import { useDialog } from '../../../providers/DialogProvider';
import { useInvalidate } from '../../../lib/supabase/hooks/useInvalidate';
import { useCallback, useState } from 'react';
import {
  generateImageThumbnail,
  generateVideoThumbnail,
} from '../../../lib/media/thumbnail';
import { logger } from '../../../lib/telemetry/logger';
import { compressImage } from '../../../lib/media/compress';
import { links as linksStorage } from '../../../lib/media-service/links';
import { trackEvent } from '../../../lib/telemetry/analytics';
import {
  createLinkMedia,
  deleteLinkMedia,
} from '../../../lib/supabase/queries/linkMedia';
import { extractMetadata } from '../../../lib/media/exif';
import { assignMediaLocations } from '../../../lib/media/assignLocations';

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

type InsertedMedia = {
  id: string;
  latitude: number | null;
  longitude: number | null;
};

export function useStagedMediaActions({
  linkId,
  partyId,
  userId,
}: UseStagedMediaActionsParams) {
  const dialog = useDialog();
  const invalidate = useInvalidate();

  const [stagedAssets, setStagedAssets] = useState<StagedAsset[]>([]);
  const [pendingMediaIds, setPendingMediaIds] = useState<string[]>([]);
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
        Burnt.toast({
          title: 'Failed to generate thumbnail',
          preset: 'error',
          haptic: 'warning',
        });
      }
    });
  }, []);

  const addFromGallery = useCallback(async () => {
    const [pickerPerm, libraryPerm] = await Promise.all([
      ImagePicker.requestMediaLibraryPermissionsAsync(),
      MediaLibrary.requestPermissionsAsync(),
    ]);

    if (!pickerPerm.granted || !libraryPerm.granted) {
      await dialog.error(
        'Permission Needed',
        'Please enable media library permissions to continue.',
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      allowsMultipleSelection: true,
      exif: true,
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

    const insertedMedia: InsertedMedia[] = [];
    const uploadedPaths: string[] = [];

    try {
      const uploadedResults = await Promise.allSettled(
        stagedAssets.map(async (item): Promise<void> => {
          const mime = item.asset.mimeType ?? 'image/jpeg';
          const type = item.asset.type === 'video' ? 'video' : 'image';
          const duration_seconds =
            type === 'video' ? (item.asset.duration ?? null) : null;

          let path: string | null = null;

          try {
            const uri =
              type === 'video'
                ? item.asset.uri
                : (await compressImage(item.asset.uri)).uri;
            const uploadMime = type === 'video' ? mime : 'image/jpeg';

            path = await linksStorage.upload(
              linkId,
              { type: 'media' },
              uri,
              uploadMime,
            );

            const { captured_at, latitude, longitude } = await extractMetadata(
              item.asset,
            );

            const row = await createLinkMedia({
              link_id: linkId,
              owner_id: userId,
              path,
              mime,
              type,
              duration_seconds,
              captured_at,
              latitude,
              longitude,
            });

            if (row) {
              insertedMedia.push({
                id: row.id,
                latitude,
                longitude,
              });
            }
            uploadedPaths.push(path);

            setProgress((prev) =>
              prev ? { ...prev, completed: prev.completed + 1 } : prev,
            );
          } catch (err) {
            if (path) {
              try {
                await linksStorage.remove([path]);
              } catch (cleanupErr) {
                logger.error('Cleanup failed: Error removing uploaded path', {
                  err: cleanupErr,
                  path,
                  linkId,
                });
              }
            }

            logger.error('Error processing asset', { err, asset: item });
            setProgress((prev) =>
              prev ? { ...prev, failed: prev.failed + 1 } : prev,
            );
            throw err;
          }
        }),
      );

      setUploading(false);
      setProgress(null);

      const successes = uploadedResults.filter((r) => r.status === 'fulfilled');
      const failures = uploadedResults.length - successes.length;

      if (successes.length === 0) {
        throw new Error('All uploads failed.');
      }

      if (failures > 0) {
        Burnt.toast({
          title: `${failures} ${failures === 1 ? 'item' : 'items'} failed to upload`,
          preset: 'error',
          haptic: 'warning',
        });
      }

      Burnt.toast({
        title: `${successes.length} ${successes.length === 1 ? 'item' : 'items'} posted.`,
        preset: 'done',
        haptic: 'success',
      });

      if (insertedMedia.length > 0) {
        try {
          const withCoords = insertedMedia.filter(
            (m): m is InsertedMedia =>
              m.latitude != null && m.longitude != null,
          );
          if (withCoords.length > 0) {
            await assignMediaLocations(
              linkId,
              withCoords.map((m) => ({
                mediaId: m.id,
                latitude: m.latitude,
                longitude: m.longitude,
              })),
            );
          }
        } catch (err) {
          logger.error('Location assignment failed after upload', {
            err,
            linkId,
          });
        }
      }

      setPendingMediaIds(insertedMedia.map((m) => m.id));
      trackEvent('media_uploaded', {
        link_id: linkId,
        count: successes.length,
      });
      invalidate.onLinkChanged(linkId, partyId);
      setStagedAssets([]);
    } catch (err) {
      setUploading(false);
      setProgress(null);

      if (insertedMedia.length) {
        try {
          await Promise.all(insertedMedia.map((m) => deleteLinkMedia(m.id)));
        } catch (cleanupErr) {
          logger.error('Cleanup failed: Error deleting link media rows', {
            err: cleanupErr,
            insertedMedia,
            linkId,
          });
        }
      }

      if (uploadedPaths.length) {
        await linksStorage.remove(uploadedPaths);
      }

      trackEvent('media_upload_failed', {
        link_id: linkId,
        count: stagedAssets.length,
      });
      logger.error('Error uploading staged media', { err, linkId });
      await dialog.error(
        'Failed to Upload Items',
        err instanceof Error ? err.message : String(err),
      );
    }
  }, [stagedAssets, linkId, userId, invalidate]);

  const clearPendingMediaIds = () => setPendingMediaIds([]);

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
    pendingMediaIds,
    clearPendingMediaIds,
  };
}
