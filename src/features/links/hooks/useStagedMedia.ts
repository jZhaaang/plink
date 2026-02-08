import * as ImagePicker from 'expo-image-picker';
import { useCallback, useState } from 'react';
import { createLinkPost } from '../../../lib/supabase/queries/linkPosts';
import { links } from '../../../lib/supabase/storage/links';
import { createLinkPostMedia } from '../../../lib/supabase/queries/linkPostMedia';

type UseStagedMediaOpts = {
  linkId: string;
  userId: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
};

type UploadProgress = {
  total: number;
  completed: number;
  failed: number;
};

export function useStagedMedia({
  linkId,
  userId,
  onSuccess,
  onError,
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
      mediaTypes: 'images',
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
      mediaTypes: 'images',
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

      const uploadAsset = async (asset: ImagePicker.ImagePickerAsset) => {
        const ext = asset.uri.split('.').pop()?.toLowerCase() || 'jpg';

        const path = await links.upload(linkId, post.id, asset.uri, ext);

        await createLinkPostMedia({
          post_id: post.id,
          path,
          mime: ext === 'png' ? 'image/png' : 'image/jpeg',
          type: 'image',
        });
      };

      const results = await Promise.allSettled(
        stagedAssets.map(async (asset) => {
          const result = await uploadAsset(asset);
          setProgress((prev) =>
            prev ? { ...prev, completed: prev.completed + 1 } : null,
          );
          return result;
        }),
      );

      const failures = results.filter((r) => r.status === 'rejected');

      if (failures.length > 0) {
        setProgress((prev) =>
          prev ? { ...prev, failed: failures.length } : null,
        );
        if (failures.length < stagedAssets.length) {
          onSuccess?.();
        }
        onError?.(new Error(`${failures.length} upload(s) failed`));
      } else {
        onSuccess?.();
      }

      setStagedAssets([]);
    } catch (err) {
      onError?.(err as Error);
    } finally {
      setUploading(false);
      setProgress(null);
    }
  }, [stagedAssets, linkId, userId, onSuccess, onError]);

  return {
    stagedAssets,
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
