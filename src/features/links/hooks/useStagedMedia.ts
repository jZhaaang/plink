import * as ImagePicker from 'expo-image-picker';
import { useCallback, useState } from 'react';
import { createLinkPost } from '../../../lib/supabase/queries/linkPosts';
import { randomUUID } from 'expo-crypto';
import { links } from '../../../lib/supabase/storage/links';
import { createLinkPostMedia } from '../../../lib/supabase/queries/linkPostMedia';

type UseStagedMediaOpts = {
  linkId: string;
  userId: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
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

  const removeAsset = useCallback(async (uri: string) => {
    setStagedAssets((prev) => prev.filter((asset) => asset.uri !== uri));
  }, []);

  const clearAll = useCallback(() => {
    setStagedAssets([]);
  }, []);

  async function uploadAll() {
    if (stagedAssets.length === 0) return;

    setUploading(true);

    try {
      const post = await createLinkPost({ link_id: linkId, owner_id: userId });

      if (!post) {
        throw new Error('Failed to create post');
      }

      for (const asset of stagedAssets) {
        const mediaId = randomUUID();
        const ext = asset.uri.split('.').pop()?.toLowerCase() || 'jpg';

        const path = await links.upload(
          linkId,
          post.id,
          mediaId,
          asset.uri,
          ext,
        );

        await createLinkPostMedia({
          post_id: post.id,
          path,
          mime: ext === 'png' ? 'image/png' : 'image/jpeg',
          type: 'image',
        });
      }

      setStagedAssets([]);
      onSuccess?.();
    } catch (err) {
      onError?.(err as Error);
    } finally {
      setUploading(false);
    }
  }

  return {
    stagedAssets,
    addFromGallery,
    addFromCamera,
    removeAsset,
    clearAll,
    uploadAll,
    uploading,
    hasAssets: stagedAssets.length > 0,
  };
}
