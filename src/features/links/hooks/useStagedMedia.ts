import * as ImagePicker from 'expo-image-picker';
import { useCallback, useState } from 'react';
import {
  createLinkPost,
  deleteLinkPost,
} from '../../../lib/supabase/queries/linkPosts';
import { links } from '../../../lib/supabase/storage/links';
import { createLinkPostMedia } from '../../../lib/supabase/queries/linkPostMedia';

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
      quality: 1,
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
      quality: 1,
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

    try {
      const post = await createLinkPost({ link_id: linkId, owner_id: userId });

      if (!post) {
        throw new Error('Failed to create post');
      }

      const uploadedResults = await Promise.allSettled(
        stagedAssets.map(async (asset): Promise<UploadedAsset> => {
          const mime = asset.mimeType ?? 'image/jpeg';
          const type = asset.type === 'video' ? 'video' : 'image';
          const path = await links.upload(linkId, post.id, asset.uri, mime);
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

      if (successes.length === 0) {
        await deleteLinkPost(post.id);
        throw new Error(`${failures} upload(s) failed`);
      }

      await Promise.all(
        successes.map((m) =>
          createLinkPostMedia({
            post_id: post.id,
            path: m.path,
            mime: m.mime,
            type: m.type,
            duration_seconds: m.duration_seconds,
          }),
        ),
      );

      if (onUploadComplete) {
        try {
          await onUploadComplete(successes);
        } catch (err) {
          onError?.(err as Error);
        }
      }

      if (failures > 0) {
        setProgress((prev) => (prev ? { ...prev, failed: failures } : null));
        onError?.(new Error(`${failures} upload(s) failed`));
      }

      onSuccess?.();
      setStagedAssets([]);
    } catch (err) {
      onError?.(err as Error);
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
