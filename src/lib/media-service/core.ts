import { logger } from '../telemetry/logger';
import {
  deleteFile,
  deleteBulk,
  getSignedUrl,
  requestUploadUrl,
  getSignedUrlsBatch,
} from './client';

async function uriToBlob(uri: string): Promise<Blob> {
  const response = await fetch(uri);
  if (!response.ok) {
    throw new Error(`Failed to read local file: ${response.status} ${uri}`);
  }
  return response.blob();
}

async function uploadToPresignedUrl(
  uploadUrl: string,
  uri: string,
  contentType: string,
  maxAttempts = 3,
): Promise<void> {
  const blob = await uriToBlob(uri);

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const res = await fetch(uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': contentType },
      body: blob,
    });

    if (res.ok) return;

    if (attempt === maxAttempts) {
      const body = await res.text().catch(() => '');
      throw new Error(
        `S3 upload failed: ${res.status} ${res.statusText} - ${body}`,
      );
    }

    await new Promise((r) => setTimeout(r, 500 * Math.pow(2, attempt - 1)));
  }
}

export async function uploadFile(
  key: string,
  uri: string,
  contentType: string,
): Promise<void> {
  const { uploadUrl } = await requestUploadUrl(key, contentType);
  await uploadToPresignedUrl(uploadUrl, uri, contentType);
  return;
}

type CachedUrl = { url: string; expiresAt: number };
const urlCache = new Map<string, CachedUrl>();
const CACHE_BUFFER = 60_000;

export async function getUrls(paths: string[]): Promise<Map<string, string>> {
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
  for (const [i, r] of urlResults.entries()) {
    if (r.status === 'fulfilled') {
      result.set(r.value.path, r.value.url);
      urlCache.set(r.value.path, { url: r.value.url, expiresAt });
    } else {
      logger.warn('Failed to resolve signed URL', {
        path: uncached[i],
        error: r.reason,
      });
    }
  }

  return result;
}

export async function getLinkMediaUrls(
  linkId: string,
  paths: string[],
): Promise<Map<string, string>> {
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

  if (uncached.length === 0) return result;

  const expiresAt = now + 3600 * 1000;
  const urlMap = await getSignedUrlsBatch(linkId, uncached);

  for (const path of uncached) {
    const url = urlMap[path];
    if (url) {
      result.set(path, url);
      urlCache.set(path, { url, expiresAt });
    } else {
      logger.warn('Failed to resolve signed URL in batch response', { path });
    }
  }

  return result;
}

export async function removeFiles(paths: string[]): Promise<void> {
  if (paths.length === 0) return;
  const results = await Promise.allSettled(paths.map((p) => deleteFile(p)));

  for (const [i, r] of results.entries()) {
    if (r.status === 'rejected') {
      logger.warn('Failed to delete file', {
        path: paths[i],
        error: r.reason,
      });
    }
  }
  return;
}

export { deleteBulk };
