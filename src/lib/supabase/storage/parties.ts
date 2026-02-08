import { uploadFile, getUrls, removeFile } from './core';

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
  getUrls(paths: string[]) {
    return getUrls('parties', paths);
  },
  remove(paths: string[]) {
    return removeFile('parties', paths);
  },
};
