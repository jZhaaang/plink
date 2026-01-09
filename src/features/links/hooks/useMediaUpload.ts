import { useState, useCallback } from 'react';
import * as ImagePicker from 'expo-image-picker';
import * as Crypto from 'expo-crypto';
import { createLinkPost } from '../../../lib/supabase/queries/linkPosts';
import { createLinkPostMedia } from '../../../lib/supabase/queries/linkPostMedia';
import { links as linksStorage } from '../../../lib/supabase/storage/links';

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
  const [progress, setProgress] = useState(0);

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

    if (result.canceled || result.assets.length === 0) {
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      const post = await createLinkPost({
        link_id: linkId,
        owner_id: userId,
      });

      if (!post) {
        throw new Error('Failed to create post');
      }

      const totalAssets = result.assets.length;

      for (let i = 0; i < result.assets.length; i++) {
        const asset = result.assets[i];
        const mediaId = Crypto.randomUUID();
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

        setProgress((i + 1) / totalAssets);
      }

      onSuccess?.();
    } catch (err) {
      onError?.(err as Error);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  }, [linkId, userId, onSuccess, onError]);

  return { pickAndUpload, uploading, progress };
}
