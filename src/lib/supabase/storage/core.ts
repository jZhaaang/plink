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

export async function getUrls(
  bucket: Bucket,
  paths: string[],
  ttl = 600 * 10,
): Promise<Map<string, string>> {
  if (paths.length === 0) return new Map();

  if (BUCKET_PRIVACY[bucket] === 'public') {
    return new Map(
      paths.map((p) => [
        p,
        supabase.storage.from(bucket).getPublicUrl(p).data.publicUrl,
      ]),
    );
  }

  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrls(paths, ttl);

  if (error) {
    logger.error(' Error creating signed urls:', error.message);
    throw error;
  }

  return new Map(data.map((d) => [d.path!, d.signedUrl]));
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
