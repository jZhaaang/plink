import { deleteBulk } from './client';
import { uploadFile, getUrls, removeFiles } from './core';

type UploadType = { type: 'avatar' };

export const profiles = {
  path(userId: string, target: UploadType) {
    switch (target.type) {
      case 'avatar':
        return `profiles/${userId}/avatar`;
    }
  },

  async upload(
    userId: string,
    target: UploadType,
    uri: string,
    contentType: string = 'image/jpeg',
  ): Promise<string> {
    const key = this.path(userId, target);
    await uploadFile(key, uri, contentType);
    return key;
  },

  getUrls,

  remove: removeFiles,

  async removeAll(userId: string): Promise<void> {
    await deleteBulk(`profiles/${userId}`);
  },
};
