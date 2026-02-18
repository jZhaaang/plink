import { supabase } from '../client';
import { logger } from '../../telemetry/logger';

export type Bucket = 'avatars' | 'parties' | 'links';
export const BUCKET_PRIVACY: Record<Bucket, 'public' | 'private'> = {
  avatars: 'public',
  parties: 'private',
  links: 'private',
};

export type UploadOpts = { contentType?: string; upsert?: boolean };

export async function uriToArrayBuffer(uri: string) {
  const result = await fetch(uri);
  const blob = await result.blob();
  return await new Response(blob).arrayBuffer();
}

export async function uploadFile(
  bucket: Bucket,
  path: string,
  uri: string,
  opts: UploadOpts = {},
) {
  const payload = await uriToArrayBuffer(uri);
  const { error } = await supabase.storage.from(bucket).upload(path, payload, {
    contentType: opts.contentType,
    upsert: opts.upsert,
  });
  if (error) {
    logger.error('Error uploading file:', error.message);
    throw error;
  }
}

export async function removeFile(bucket: Bucket, paths: string[]) {
  if (paths.length === 0) return;

  const { error } = await supabase.storage.from(bucket).remove(paths);
  if (error) {
    logger.error('Error removing file:', error.message);
    throw error;
  }
}

type CachedUrl = { url: string; expiresAt: number };
const urlCache = new Map<string, CachedUrl>();
const CACHE_BUFFER = 60_000;

export async function getUrls(
  bucket: Bucket,
  paths: string[],
  ttl = 600 * 10,
): Promise<Map<string, string>> {
  if (paths.length === 0) return new Map();

  const now = Date.now();
  const result = new Map<string, string>();
  const uncached: string[] = [];

  for (const p of paths) {
    const key = `${bucket}:${p}`;
    const cached = urlCache.get(key);
    if (cached && cached.expiresAt - CACHE_BUFFER > now) {
      result.set(p, cached.url);
    } else {
      uncached.push(p);
    }
  }

  if (uncached.length === 0) return result;

  if (BUCKET_PRIVACY[bucket] === 'public') {
    for (const p of uncached) {
      const url = supabase.storage.from(bucket).getPublicUrl(p).data.publicUrl;
      result.set(p, url);
      urlCache.set(`${bucket}:${p}`, { url, expiresAt: now + 3_600_000 });
    }
    return result;
  }

  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrls(uncached, ttl);

  if (error) {
    logger.error('Error creating signed urls:', error.message);
    throw error;
  }

  const expiresAt = now + ttl * 1000;
  for (const d of data) {
    result.set(d.path, d.signedUrl);
    urlCache.set(`${bucket}:${d.path}`, { url: d.signedUrl, expiresAt });
  }

  return result;
}

export async function getPathsById(
  bucket: Bucket,
  id: string,
): Promise<string[]> {
  const pageSize = 100;
  const results: string[] = [];

  async function walk(currentPrefix: string): Promise<void> {
    let offset = 0;

    while (true) {
      const { data, error } = await supabase.storage
        .from(bucket)
        .list(currentPrefix, {
          limit: pageSize,
          offset,
          sortBy: { column: 'name', order: 'asc' },
        });

      if (error) {
        logger.error('Error listing storage prefix:', {
          bucket,
          prefix: currentPrefix,
          detail: error.message,
        });
        throw error;
      }

      if (!data || data.length === 0) break;

      for (const entry of data) {
        const fullPath = currentPrefix
          ? `${currentPrefix}/${entry.name}`
          : entry.name;
        const isDirectory = entry.id === null; // null id for Supabase folders

        if (isDirectory) {
          await walk(fullPath);
        } else {
          results.push(fullPath);
        }
      }

      if (data.length < pageSize) break;
      offset += data.length;
    }
  }

  await walk(id);
  return results;
}
