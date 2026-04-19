import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';

export type ExtractedMetadata = {
  captured_at: string | null;
  latitude: number | null;
  longitude: number | null;
};

function parseExifGps(
  exif: ImagePicker.ImagePickerAsset['exif'],
): { latitude: number; longitude: number } | null {
  if (!exif) return null;

  const lat = Number(exif.GPSLatitude);
  const long = Number(exif.GPSLongitude);
  const latRef = String(exif.GPSLatitudeRef ?? 'N');
  const longRef = String(exif.GPSLongitudeRef ?? 'E');

  if (!Number.isFinite(lat) || !Number.isFinite(long)) return null;

  return {
    latitude: latRef === 'S' ? -lat : lat,
    longitude: longRef === 'W' ? -long : long,
  };
}

export async function extractMetadata(
  asset: ImagePicker.ImagePickerAsset,
): Promise<ExtractedMetadata> {
  const fromExif = parseExifGps(asset.exif);

  if (!asset.assetId) {
    return {
      captured_at: null,
      latitude: fromExif?.latitude ?? null,
      longitude: fromExif?.longitude ?? null,
    };
  }

  try {
    const info = await MediaLibrary.getAssetInfoAsync(asset.assetId);
    const lat = Number(info.location?.latitude);
    const long = Number(info.location?.longitude);
    return {
      captured_at: info.creationTime
        ? new Date(info.creationTime).toISOString()
        : null,
      latitude: fromExif?.latitude ?? (Number.isFinite(lat) ? lat : null),
      longitude: fromExif?.longitude ?? (Number.isFinite(long) ? long : null),
    };
  } catch {
    return {
      captured_at: null,
      latitude: fromExif?.latitude ?? null,
      longitude: fromExif?.longitude ?? null,
    };
  }
}
