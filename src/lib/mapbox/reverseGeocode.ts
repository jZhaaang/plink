import { supabase } from '../supabase/client';
import {
  MapboxFeatureCollection,
  MapboxPlace,
  SearchBoxProperties,
} from './types';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const PROXY_BASE = `${SUPABASE_URL}/functions/v1/mapbox-proxy`;

const PLACE_TYPE_PRIORITY = [
  'poi',
  'address',
  'street',
  'neighborhood',
  'place',
] as const;

async function getAuthHeader(): Promise<string | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session ? `Bearer ${session.access_token}` : null;
}

export async function reverseGeocode(
  latitude: number,
  longitude: number,
): Promise<MapboxPlace> {
  const auth = await getAuthHeader();
  if (!auth) return null;

  const params = new URLSearchParams({
    longitude: String(longitude),
    latitude: String(latitude),
    limit: '3',
    language: 'en',
  });

  const res = await fetch(
    `${PROXY_BASE}/search/searchbox/v1/reverse?${params}`,
    {
      headers: {
        Authorization: auth,
      },
    },
  );

  if (!res.ok) return null;

  const data =
    (await res.json()) as MapboxFeatureCollection<SearchBoxProperties>;

  for (const targetType of PLACE_TYPE_PRIORITY) {
    const feature = data.features.find(
      (f) => f.properties.feature_type === targetType,
    );
    if (!feature) continue;

    const [long, lat] = feature.geometry.coordinates;
    return {
      mapbox_id: feature.properties.mapbox_id,
      name: feature.properties.name,
      address: feature.properties.address,
      fullAddress: feature.properties.full_address,
      placeFormatted: feature.properties.place_formatted,
      latitude: lat,
      longitude: long,
    };
  }

  return null;
}
