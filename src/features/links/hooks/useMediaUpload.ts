import { useState, useCallback } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { createLinkPost } from '../../../lib/supabase/queries/linkPosts';
import { createLinkPostMedia } from '../../../lib/supabase/queries/linkPostMedia';
import { links as linksStorage } from '../../../lib/supabase/storage/links';
import { randomUUID } from 'expo-crypto';

type UseMediaUploadOptions = {
  linkId: string;
  userId: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
};

export function useMediaUpload({
  linkId,
  userId,
  onSuccess,
  onError,
}: UseMediaUploadOptions) {
  const [uploading, setUploading] = useState(false);

  async function uploadAssets(assets: ImagePicker.ImagePickerAsset[]) {
    if (assets.length === 0) return;
    setUploading(true);
    try {
      const post = await createLinkPost({ link_id: linkId, owner_id: userId });

      if (!post) {
        throw new Error('Failed to create post');
      }

      for (const asset of assets) {
        const mediaId = randomUUID();
        const ext = asset.uri.split('.').pop()?.toLowerCase() || 'jpg';

        const path = await linksStorage.upload(
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
      onSuccess?.();
    } catch (err) {
      onError?.(err);
    } finally {
      setUploading(false);
    }
  }

  const pickAndUpload = useCallback(async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      onError?.(new Error('Permission to access photos was denied'));
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.8,
      exif: false,
    });

    if (!result.canceled) {
      await uploadAssets(result.assets);
    }
  }, [linkId, userId]);

  const captureAndUpload = useCallback(async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      onError?.(new Error('Permission to access camera was denied'));
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      exif: false,
    });

    if (!result.canceled) {
      await uploadAssets(result.assets);
    }
  }, [linkId, userId]);

  return { pickAndUpload, captureAndUpload, uploading };
}
