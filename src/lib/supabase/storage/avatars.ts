import { randomUUID } from 'expo-crypto';
import { uploadFile, getUrls, removeFile } from './core';

export const avatars = {
  path(userId: string, ext: string = 'jpg') {
    return `users/${userId}/${randomUUID()}.${ext}`;
  },
  async upload(userId: string, uri: string, ext: string = 'jpg') {
    const path = this.path(userId, ext);
    await uploadFile('avatars', path, uri, {
      contentType: ext === 'png' ? 'image/png' : 'image/jpeg',
      upsert: false,
    });

    return path;
  },
  getUrls(paths: string[]) {
    return getUrls('avatars', paths);
  },
  remove(paths: string[]) {
    return removeFile('avatars', paths);
  },
};
