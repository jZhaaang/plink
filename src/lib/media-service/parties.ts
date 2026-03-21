import { deleteBulk } from './client';
import { uploadFile, getUrls, removeFiles } from './core';

type UploadType = { type: 'avatar' | 'banner' };

export const parties = {
  path(partyId: string, target: UploadType) {
    switch (target.type) {
      case 'avatar':
        return `parties/${partyId}/avatar`;
      case 'banner':
        return `parties/${partyId}/banner`;
    }
  },

  async upload(
    partyId: string,
    target: UploadType,
    uri: string,
    contentType: string = 'image/jpeg',
  ): Promise<string> {
    const key = this.path(partyId, target);
    await uploadFile(key, uri, contentType);
    return key;
  },

  getUrls,

  remove: removeFiles,

  async removeAll(partyId: string): Promise<void> {
    await deleteBulk(`parties/${partyId}`);
  },
};
