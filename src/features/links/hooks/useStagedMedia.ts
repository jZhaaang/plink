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

type UseStagedMediaOpts = {
  linkId: string;
  userId: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  onUploadComplete?: (uploaded: UploadedAsset[]) => Promise<void> | void;
};

type UploadProgress = {
  total: number;
  completed: number;
  failed: number;
};

type UploadedAsset = {
  path: string;
  mime: string;
  type: 'image' | 'video';
  duration_seconds: number | null;
};

export function useStagedMedia({
  linkId,
  userId,
  onSuccess,
  onError,
  onUploadComplete,
}: UseStagedMediaOpts) {
  const [stagedAssets, setStagedAssets] = useState<
    ImagePicker.ImagePickerAsset[]
  >([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress | null>(null);

  const stageAssets = useCallback((assets: ImagePicker.ImagePickerAsset[]) => {
    setStagedAssets((prev) => [...prev, ...assets]);
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
    setStagedAssets((prev) => prev.filter((asset) => asset.uri !== uri));
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

      if (!post) {
        throw new Error('Failed to create post');
      }

      const uploadedResults = await Promise.allSettled(
        stagedAssets.map(async (asset): Promise<UploadedAsset> => {
          const mime = asset.mimeType ?? 'image/jpeg';
          const type = asset.type === 'video' ? 'video' : 'image';
          const uri =
            type === 'video' ? asset.uri : (await compressImage(asset.uri)).uri;
          const path = await linksStorage.upload(linkId, post.id, uri, mime);
          setProgress((prev) =>
            prev ? { ...prev, completed: prev.completed + 1 } : null,
          );
          return {
            path,
            mime,
            type,
            duration_seconds:
              type === 'video' ? (asset.duration ?? null) : null,
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
            mime: m.mime,
            type: m.type,
            duration_seconds: m.duration_seconds,
          });
          if (row) insertedMediaIds.push(row.id);
        }),
      );

      await onUploadComplete?.(successes);

      if (failures > 0) {
        setProgress((prev) => (prev ? { ...prev, failed: failures } : null));
        onError?.(new Error(`${failures} upload(s) failed`));
      }

      onSuccess?.();
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
      onError?.(err instanceof Error ? err : new Error('Upload failed'));
    } finally {
      setUploading(false);
      setProgress(null);
    }
  }, [stagedAssets, linkId, userId, onSuccess, onError, onUploadComplete]);

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
