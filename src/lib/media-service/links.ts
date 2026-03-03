import { randomUUID } from 'expo-crypto';
import { extFromMime } from '../utils/extFromMime';
import { deleteBulk } from './client';
import { uploadFile, getUrls, removeFiles } from './core';

type UploadType = { type: 'post'; postId: string } | { type: 'banner' };

export const links = {
  path(linkId: string, target: UploadType, contentType: string) {
    const ext = extFromMime(contentType);

    switch (target.type) {
      case 'post':
        return `links/${linkId}/posts/${target.postId}/${randomUUID()}.${ext}`;
      case 'banner':
        return `links/${linkId}/banner`;
    }
  },

  async upload(
    linkId: string,
    target: UploadType,
    uri: string,
    contentType: string = 'image/jpeg',
  ): Promise<string> {
    const key = this.path(linkId, target, contentType);
    await uploadFile(key, uri, contentType);
    return key;
  },

  getUrls,

  remove: removeFiles,

  async removeAll(linkId: string): Promise<void> {
    await deleteBulk(`links/${linkId}`);
  },
};
