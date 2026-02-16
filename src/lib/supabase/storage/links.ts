import { randomUUID } from 'expo-crypto';
import { uploadFile, getUrls, removeFile, getPathsById } from './core';
import { extFromMime } from '../../utils/extFromMime';

export const links = {
  path(linkId: string, postId: string, contentType: string) {
    return `${linkId}/posts/${postId}/${randomUUID()}.${extFromMime(contentType)}`;
  },

  bannerPath(linkId: string, contentType: string = 'image/jpeg') {
    return `${linkId}/banner.${extFromMime(contentType)}`;
  },

  async upload(
    linkId: string,
    postId: string,
    uri: string,
    contentType: string = 'image/jpeg',
  ) {
    const path = this.path(linkId, postId, contentType);
    await uploadFile('links', path, uri, {
      contentType,
      upsert: false,
    });
    return path;
  },

  async uploadBanner(
    linkId: string,
    uri: string,
    contentType: string = 'image/jpeg',
  ) {
    const path = this.bannerPath(linkId, contentType);
    await uploadFile('links', path, uri, { contentType, upsert: true });
    return path;
  },

  getUrls(paths: string[]) {
    return getUrls('links', paths);
  },

  remove(paths: string[]) {
    return removeFile('links', paths);
  },

  getPathsById(linkId: string) {
    return getPathsById('links', linkId);
  },
};
