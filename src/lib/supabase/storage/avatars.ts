import { randomUUID } from 'expo-crypto';
import { uploadFile, getUrl, removeFile } from './core';

export const avatars = {
  path(userId: string, avatarId: string, ext: string = 'jpg') {
    return `users/${userId}/${avatarId}.${ext}`;
  },
  async upload(
    userId: string,
    uri: string,
    oldAvatarId?: string,
    ext: string = 'jpg',
  ) {
    const uuid = randomUUID();
    const path = this.path(userId, uuid, ext);
    await uploadFile('avatars', path, uri, {
      contentType: ext === 'png' ? 'image/png' : 'image/jpeg',
      upsert: true,
    });

    if (oldAvatarId) {
      await removeFile('avatars', [this.path(userId, oldAvatarId, ext)]);
    }

    return uuid;
  },
  getUrl(userId: string, avatarId: string, ext: string = 'jpg') {
    return getUrl('avatars', this.path(userId, avatarId, ext));
  },
  remove(userId: string, avatarId: string, ext: string = 'jpg') {
    return removeFile('avatars', [this.path(userId, avatarId, ext)]);
  },
};
