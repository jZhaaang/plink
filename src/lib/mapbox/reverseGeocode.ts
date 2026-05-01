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

export function reverseGeocode(
  latitude: number,
  longitude: number,
): Promise<MapboxPlace | null>;

export function reverseGeocode(
  latitude: number,
  longitude: number,
  results: number,
): Promise<MapboxPlace[]>;

export async function reverseGeocode(
  latitude: number,
  longitude: number,
  results?: number,
): Promise<MapboxPlace | MapboxPlace[] | null> {
  const auth = await getAuthHeader();
  if (!auth) return null;

  const limit = results ?? 3;
  const params = new URLSearchParams({
    longitude: String(longitude),
    latitude: String(latitude),
    limit: String(limit),
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

  const toPlace = (f: (typeof data.features)[number]): MapboxPlace => {
    const [long, lat] = f.geometry.coordinates;
    return {
      mapbox_id: f.properties.mapbox_id,
      name: f.properties.name,
      address: f.properties.address,
      fullAddress: f.properties.full_address,
      placeFormatted: f.properties.place_formatted,
      latitude: lat,
      longitude: long,
    };
  };

  const priorityRank = (type: string) => {
    const idx = PLACE_TYPE_PRIORITY.indexOf(
      type as (typeof PLACE_TYPE_PRIORITY)[number],
    );
    return idx === -1 ? Infinity : idx;
  };

  const sorted = [...data.features]
    .filter((f) => priorityRank(f.properties.feature_type) !== Infinity)
    .sort(
      (a, b) =>
        priorityRank(a.properties.feature_type) -
        priorityRank(b.properties.feature_type),
    )
    .map(toPlace);

  if (results === undefined) return sorted[0] ?? null;
  return sorted.slice(0, results);
}
