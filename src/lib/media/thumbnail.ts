import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { createVideoPlayer } from 'expo-video';

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
  const player = createVideoPlayer(uri);

  try {
    const [thumbnail] = await player.generateThumbnailsAsync(0.5, {
      maxWidth: THUMB_MAX_DIMENSION,
    });

    const result = await ImageManipulator.manipulate(thumbnail)
      .resize({ width: THUMB_MAX_DIMENSION })
      .renderAsync();

    return (
      await result.saveAsync({
        compress: THUMB_QUALITY,
        format: SaveFormat.JPEG,
      })
    ).uri;
  } finally {
    player.release();
  }
}
