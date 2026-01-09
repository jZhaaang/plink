import { uploadFile, getUrl, removeFile } from './core';

export const links = {
  path(linkId: string, postId: string, mediaId: string, ext: string = 'jpg') {
    return `${linkId}/posts/${postId}/${mediaId}.${ext}`;
  },

  async upload(
    linkId: string,
    postId: string,
    mediaId: string,
    uri: string,
    ext: string = 'jpg',
  ) {
    const path = this.path(linkId, postId, mediaId, ext);
    await uploadFile('links', path, uri, {
      contentType: ext === 'png' ? 'image/png' : 'image/jpeg',
      upsert: false,
    });
    return path;
  },

  getUrl(path: string) {
    return getUrl('links', path);
  },

  remove(linkId: string, postId: string, mediaId: string, ext: string = 'jpg') {
    return removeFile('links', [this.path(linkId, postId, mediaId, ext)]);
  },
};
