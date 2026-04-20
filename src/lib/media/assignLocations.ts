import { reverseGeocode } from '../mapbox/reverseGeocode';
import {
  haversineDistance,
  getLinkLocations,
  createLinkLocation,
} from '../supabase/queries/linkLocations';
import { setLinkMediaLocation } from '../supabase/queries/linkMedia';
import { LinkLocationRow } from '../models';
import { logger } from '../telemetry/logger';

const CLUSTER_RADIUS_METERS = 100;

type MediaCoord = { mediaId: string; latitude: number; longitude: number };

type Cluster = {
  items: MediaCoord[];
  centroid: { latitude: number; longitude: number };
};

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

function clusterItems(items: MediaCoord[]): Cluster[] {
  const clusters: Cluster[] = [];

  for (const item of items) {
    let nearest: Cluster | null = null;
    let nearestDist = Infinity;

    for (const cluster of clusters) {
      const dist = haversineDistance(
        cluster.centroid.latitude,
        cluster.centroid.longitude,
        item.latitude,
        item.longitude,
      );
      if (dist < nearestDist) {
        nearestDist = dist;
        nearest = cluster;
      }
    }

    if (nearest && nearestDist < CLUSTER_RADIUS_METERS) {
      nearest.items.push(item);
      nearest.centroid = {
        latitude: median(nearest.items.map((i) => i.latitude)),
        longitude: median(nearest.items.map((i) => i.longitude)),
      };
    } else {
      clusters.push({
        items: [item],
        centroid: { latitude: item.latitude, longitude: item.longitude },
      });
    }
  }

  return clusters;
}

function findNearestInList(
  locations: LinkLocationRow[],
  latitude: number,
  longitude: number,
): LinkLocationRow | null {
  let nearest: LinkLocationRow | null = null;
  let nearestDist = Infinity;
  for (const loc of locations) {
    const dist = haversineDistance(
      latitude,
      longitude,
      loc.latitude,
      loc.longitude,
    );
    if (dist < nearestDist) {
      nearestDist = dist;
      nearest = loc;
    }
  }
  return nearest && nearestDist <= CLUSTER_RADIUS_METERS ? nearest : null;
}

export async function assignMediaLocations(
  linkId: string,
  items: MediaCoord[],
): Promise<void> {
  if (items.length === 0) return;

  const existingLocations = await getLinkLocations(linkId);
  const knownLocations = [...existingLocations];

  const clusters = clusterItems(items);

  for (const cluster of clusters) {
    const { latitude, longitude } = cluster.centroid;

    let match = findNearestInList(knownLocations, latitude, longitude);

    if (!match) {
      const place = await reverseGeocode(latitude, longitude);
      const name =
        place?.name ??
        place?.address ??
        `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;

      try {
        const newLocation = await createLinkLocation({
          link_id: linkId,
          latitude,
          longitude,
          name,
          address: place?.address,
          full_address: place?.fullAddress,
          place_formatted: place?.placeFormatted,
          mapbox_id: place?.mapbox_id,
          order_index: knownLocations.length,
          source: 'exif',
        });
        knownLocations.push(newLocation);
        match = newLocation;
      } catch (err) {
        logger.error('Failed to create link location', {
          err,
          linkId,
          latitude,
          longitude,
          place,
        });
        continue;
      }
    }

    await Promise.all(
      cluster.items.map((item) =>
        setLinkMediaLocation(item.mediaId, match!.id),
      ),
    );
  }
}
