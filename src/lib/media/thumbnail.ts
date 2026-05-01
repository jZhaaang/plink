import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import * as VideoThumbnails from 'expo-video-thumbnails';

const THUMB_MAX_DIMENSION = 300;
const THUMB_QUALITY = 0.5;

export async function generateImageThumbnail(uri: string): Promise<string> {
  const result = await ImageManipulator.manipulate(uri)
    .resize({ width: THUMB_MAX_DIMENSION })
    .renderAsync();

  const saved = await result.saveAsync({
    compress: THUMB_QUALITY,
    format: SaveFormat.JPEG,
  });

  return saved.uri;
}

export async function generateVideoThumbnail(uri: string): Promise<string> {
  let thumbnailUri: string;

  try {
    const result = await VideoThumbnails.getThumbnailAsync(uri, { time: 1000 });
    thumbnailUri = result.uri;
  } catch {
    const result = await VideoThumbnails.getThumbnailAsync(uri, { time: 0 });
    thumbnailUri = result.uri;
  }

  return generateImageThumbnail(thumbnailUri);
}
