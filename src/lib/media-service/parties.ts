import { extFromMime } from '../utils/extFromMime';
import { deleteFile, getSignedUrl, requestUploadUrl } from './client';

async function uriToBlob(uri: string): Promise<Blob> {
  const response = await fetch(uri);
  return response.blob();
}

async function uploadToPresignedUrl(
  uploadUrl: string,
  uri: string,
  contentType: string,
): Promise<void> {
  const blob = await uriToBlob(uri);

  const res = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': contentType },
    body: blob,
  });

  if (!res.ok) {
    throw new Error(`S3 upload failed: ${res.status}`);
  }

  return;
}

type CachedUrl = { url: string; expiresAt: number };
const urlCache = new Map<string, CachedUrl>();
const CACHE_BUFFER = 60_000;

export const parties = {
  bannerPath(partyId: string, contentType: string = 'image/jpeg') {
    return `parties/${partyId}/banner.${extFromMime(contentType)}`;
  },

  async uploadBanner(
    partyId: string,
    uri: string,
    contentType: string = 'image/jpeg',
  ): Promise<string> {
    const key = this.bannerPath(partyId, contentType);
    const { uploadUrl } = await requestUploadUrl(key, contentType);
    await uploadToPresignedUrl(uploadUrl, uri, contentType);
    return key;
  },

  async getUrls(paths: string[]): Promise<Map<string, string>> {
    if (paths.length === 0) return new Map();

    const now = Date.now();
    const result = new Map<string, string>();
    const uncached: string[] = [];

    for (const p of paths) {
      const cached = urlCache.get(p);
      if (cached && cached.expiresAt - CACHE_BUFFER > now) {
        result.set(p, cached.url);
      } else {
        uncached.push(p);
      }
    }

    const urlResults = await Promise.allSettled(
      uncached.map(async (path) => {
        const url = await getSignedUrl(path);
        return { path, url };
      }),
    );

    const expiresAt = now + 3600 * 1000;
    for (const r of urlResults) {
      if (r.status === 'fulfilled') {
        result.set(r.value.path, r.value.url);
        urlCache.set(r.value.path, { url: r.value.url, expiresAt });
      }
    }

    return result;
  },

  async remove(paths: string[]): Promise<void> {
    if (paths.length === 0) return;
    await Promise.allSettled(paths.map((p) => deleteFile(p)));
    return;
  },
};
