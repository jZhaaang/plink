import { randomUUID } from 'expo-crypto';
import { uploadFile, getUrls, removeFile } from './core';

export const links = {
  path(linkId: string, postId: string, ext: string = 'jpg') {
    return `${linkId}/posts/${postId}/${randomUUID()}.${ext}`;
  },

  async upload(
    linkId: string,
    postId: string,
    uri: string,
    ext: string = 'jpg',
  ) {
    const path = this.path(linkId, postId, ext);
    await uploadFile('links', path, uri, {
      contentType: ext === 'png' ? 'image/png' : 'image/jpeg',
      upsert: false,
    });
    return path;
  },

  getUrls(paths: string[]) {
    return getUrls('links', paths);
  },

  remove(paths: string[]) {
    return removeFile('links', paths);
  },
};
