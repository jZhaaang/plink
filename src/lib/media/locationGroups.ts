import { LinkMedia } from '../models';

export type LocationGroup = {
  key: string;
  centroid: { latitude: number; longitude: number } | null;
  media: LinkMedia[];
};

const CLUSTER_RADIUS_METERS = 100;

function haversineDistance(
  lat1: number,
  long1: number,
  lat2: number,
  long2: number,
): number {
  const R = 6371000;
  const toRad = (x: number) => (x * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLong = toRad(long2 - long1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLong / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function medianCoord(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

export function groupMediaByLocation(media: LinkMedia[]): LocationGroup[] {
  const sorted = [...media].sort((a, b) => {
    if (!a.captured_at) return 1;
    if (!b.captured_at) return -1;
    return a.captured_at.localeCompare(b.captured_at);
  });

  const groups: LocationGroup[] = [];
  const noCoords: LinkMedia[] = [];

  for (const item of sorted) {
    if (item.latitude == null || item.longitude == null) {
      noCoords.push(item);
      continue;
    }

    let nearest: LocationGroup | null = null;
    let nearestDist = Infinity;
    for (const group of groups) {
      if (!group.centroid) continue;
      const dist = haversineDistance(
        group.centroid.latitude,
        group.centroid.longitude,
        item.latitude,
        item.longitude,
      );
      if (dist < nearestDist) {
        nearestDist = dist;
        nearest = group;
      }
    }

    if (nearest && nearestDist <= CLUSTER_RADIUS_METERS) {
      nearest.media.push(item);
      nearest.centroid = {
        latitude: medianCoord(nearest.media.map((m) => m.latitude!)),
        longitude: medianCoord(nearest.media.map((m) => m.longitude!)),
      };
    } else {
      groups.push({
        key: item.id,
        centroid: { latitude: item.latitude, longitude: item.longitude },
        media: [item],
      });
    }
  }

  if (noCoords.length > 0) {
    groups.push({ key: 'unknown', centroid: null, media: noCoords });
  }

  return groups.sort((a, b) => {
    const aTime = a.media[0]?.captured_at ?? '';
    const bTime = b.media[0]?.captured_at ?? '';
    return aTime.localeCompare(bTime);
  });
}
