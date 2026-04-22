import { supabase } from '../supabase/client';
import { RetrievedPlace, SearchBoxProperties, SearchSuggestion } from './types';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const PROXY_BASE = `${SUPABASE_URL}/functions/v1/mapbox-proxy`;

async function getAuthHeader(): Promise<string | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session ? `Bearer ${session.access_token}` : null;
}

export async function suggestPlaces(
  query: string,
  sessionToken: string,
  proximity?: { longitude: number; latitude: number },
): Promise<SearchSuggestion[]> {
  if (!query.trim()) return [];

  const auth = await getAuthHeader();
  if (!auth) return [];

  const params = new URLSearchParams({
    q: query,
    session_token: sessionToken,
    limit: '6',
    language: 'en',
  });

  if (proximity) {
    params.set('proximity', `${proximity.longitude},${proximity.latitude}`);
  }

  const res = await fetch(
    `${PROXY_BASE}/search/searchbox/v1/suggest?${params}`,
    {
      headers: {
        Authorization: auth,
      },
    },
  );

  if (!res.ok) throw new Error('Search failed');

  const data = (await res.json()) as { suggestions?: SearchBoxProperties[] };
  return (data.suggestions ?? [])
    .filter((s) => s.feature_type !== 'brand')
    .map(
      (s) =>
        ({
          mapbox_id: s.mapbox_id,
          name: s.name,
          address: s.address ?? null,
          place_formatted: s.place_formatted ?? null,
          feature_type: s.feature_type,
        }) as SearchSuggestion,
    );
}

export async function retrievePlace(
  mapboxId: string,
  sessionToken: string,
): Promise<RetrievedPlace | null> {
  const auth = await getAuthHeader();
  if (!auth) return null;

  const params = new URLSearchParams({ session_token: sessionToken });

  const res = await fetch(
    `${PROXY_BASE}/search/searchbox/v1/retrieve/${encodeURIComponent(mapboxId)}?${params}`,
    { headers: { Authorization: auth } },
  );

  if (!res.ok) throw new Error('Retrieve failed');

  const data = await res.json();
  const feature = data.features?.[0];
  if (!feature) return null;

  const props = feature.properties;
  const [longitude, latitude] = feature.geometry.coordinates;

  return {
    mapbox_id: props.mapbox_id,
    name: props.name,
    address: props.full_address ?? props.address ?? null,
    longitude,
    latitude,
  } as RetrievedPlace;
}
