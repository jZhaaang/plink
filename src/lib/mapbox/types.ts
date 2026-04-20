export type MapboxPlace = {
  mapbox_id: string;
  name: string;
  address: string | null;
  fullAddress: string | null;
  placeFormatted: string | null;
  latitude: number;
  longitude: number;
};

type MapboxFeature<P extends Record<string, unknown>> = {
  type: 'Feature';
  geometry: { type: 'Point'; coordinates: [number, number] };
  properties: P;
};

export type MapboxFeatureCollection<P extends Record<string, unknown>> = {
  type: 'FeatureCollection';
  features: MapboxFeature<P>[];
};

export type SearchBoxProperties = {
  mapbox_id: string;
  name: string;
  feature_type: string;
  address?: string;
  full_address?: string;
  place_formatted?: string;
};
