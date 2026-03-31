import { createClient } from 'jsr:@supabase/supabase-js@2';

const MAPBOX_BASE = 'https://api.mapbox.com';

Deno.serve(async (req) => {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response('Unauthorized', { status: 401 });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL'),
    Deno.env.get('SUPABASE_ANON_KEY'),
  );

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));

  if (error || !user) {
    return new Response('Unauthorized', { status: 401 });
  }

  const incomingUrl = new URL(req.url);
  const mapboxUrl = new URL(
    MAPBOX_BASE + incomingUrl.pathname.replace('/mapbox-proxy', ''),
  );

  incomingUrl.searchParams.forEach((value, key) => {
    mapboxUrl.searchParams.set(key, value);
  });
  mapboxUrl.searchParams.set('access_token', Deno.env.get('MAPBOX_TOKEN'));

  const response = await fetch(mapboxUrl.toString(), {
    method: req.method,
    headers: { 'Content-Type': 'application/json' },
    body: req.method !== 'GET' ? req.body : undefined,
  });

  const data = await response.json();
  return new Response(JSON.stringify(data), {
    status: response.status,
    headers: { 'Content-Type': 'application/json' },
  });
});
