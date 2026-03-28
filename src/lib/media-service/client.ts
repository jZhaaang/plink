import { supabase } from '../supabase/client';

const BASE_URL =
  process.env.EXPO_PUBLIC_MEDIA_SERVICE_URL || 'http://localhost:3001';

async function getAuthHeaders(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;

  if (!token) throw new Error('Not authenticated');

  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

export async function requestUploadUrl(
  key: string,
  contentType: string,
): Promise<{ uploadUrl: string; key: string }> {
  const headers = await getAuthHeaders();

  const res = await fetch(`${BASE_URL}/media/upload`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ key, contentType }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error || `Upload request failed: ${res.status}`);
  }

  return res.json();
}

export async function getSignedUrl(key: string): Promise<string> {
  const headers = await getAuthHeaders();

  const res = await fetch(`${BASE_URL}/media/url/${key}`, { headers });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error || `Signed URL request failed: ${res.status}`);
  }

  const data = await res.json();
  return data.url;
}

export async function getSignedUrlsBatch(
  linkId: string,
  keys: string[],
): Promise<Record<string, string>> {
  const headers = await getAuthHeaders();

  const res = await fetch(`${BASE_URL}/media/urls`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ linkId, keys }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(
      body?.error || `Batch signed URL request failed: ${res.status}`,
    );
  }

  const data = await res.json();
  return data.urls as Record<string, string>;
}

export async function deleteFile(key: string): Promise<void> {
  const headers = await getAuthHeaders();

  const res = await fetch(`${BASE_URL}/media/${key}`, {
    method: 'DELETE',
    headers,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error || `Delete request failed: ${res.status}`);
  }

  return;
}

export async function deleteBulk(prefix: string): Promise<void> {
  const headers = await getAuthHeaders();

  const res = await fetch(`${BASE_URL}/media/bulk/${prefix}`, {
    method: 'DELETE',
    headers,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error || `Bulk delete failed: ${res.status}`);
  }
}
