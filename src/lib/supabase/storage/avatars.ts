import { uploadFile, getUrl, removeFile } from './core';

export const avatars = {
  path(userId: string, ext: string = 'jpg') {
    return `users/${userId}.${ext}`;
  },
  async upload(userId: string, uri: string, ext: string = 'jpg') {
    const path = this.path(userId, ext);
    await uploadFile('avatars', path, uri, {
      contentType: ext === 'png' ? 'image/png' : 'image/jpeg',
      upsert: true,
    });
    return path;
  },
  getUrl(userId: string, ext: string = 'jpg') {
    return getUrl('avatars', this.path(userId, ext));
  },
  remove(userId: string, ext: string = 'jpg') {
    return removeFile('avatars', [this.path(userId, ext)]);
  },
};
