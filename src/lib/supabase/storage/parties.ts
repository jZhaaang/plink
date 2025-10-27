import { uploadFile, getUrl, removeFile } from './core';

export const parties = {
  path(partyId: string, type: 'avatar' | 'banner', ext: string = 'jpg') {
    return `${partyId}/${type}.${ext}`;
  },
  async upload(
    partyId: string,
    type: 'avatar' | 'banner',
    uri: string,
    ext: string = 'jpg',
  ) {
    const path = this.path(partyId, type, ext);
    await uploadFile('parties', path, uri, {
      contentType: ext === 'png' ? 'image/png' : 'image/jpeg',
      upsert: true,
    });
    return path;
  },
  getUrl(partyId: string, type: 'avatar' | 'banner', ext: string = 'jpg') {
    return getUrl('parties', this.path(partyId, type, ext));
  },
  remove(partyId: string, type: 'avatar' | 'banner', ext: string = 'jpg') {
    return removeFile('parties', [this.path(partyId, type, ext)]);
  },
};
