import { uploadFile, getUrl, removeFile } from './core';

export const parties = {
  path(partyId: string, ext: string = 'jpg') {
    return `${partyId}/banner.${ext}`;
  },
  async upload(partyId: string, uri: string, ext: string = 'jpg') {
    const path = this.path(partyId, ext);
    await uploadFile('parties', path, uri, {
      contentType: ext === 'png' ? 'image/png' : 'image/jpeg',
      upsert: true,
    });
    return path;
  },
  getUrl(partyId: string, ext: string = 'jpg') {
    return getUrl('parties', this.path(partyId, ext));
  },
  remove(partyId: string, ext: string = 'jpg') {
    return removeFile('parties', [this.path(partyId, ext)]);
  },
};
