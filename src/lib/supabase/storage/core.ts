import { supabase } from '../client';
import { logger } from '../logger';

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
