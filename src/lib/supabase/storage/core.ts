import { supabase } from '../client';

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
  if (error) throw error;
}

export async function removeFile(bucket: Bucket, paths: string[]) {
  const { error } = await supabase.storage.from(bucket).remove(paths);
  if (error) throw error;
}

export async function getUrl(bucket: Bucket, path: string, ttl = 60 * 10) {
  if (BUCKET_PRIVACY[bucket] === 'public') {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  } else {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, ttl);
    if (error) throw error;
    return data.signedUrl;
  }
}
