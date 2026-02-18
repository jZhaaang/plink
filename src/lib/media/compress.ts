import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';

export async function compressImage(
  uri: string,
  maxDimension: number = 1920,
  quality: number = 0.7,
) {
  const result = await ImageManipulator.manipulate(uri)
    .resize({ width: maxDimension })
    .renderAsync();

  return result.saveAsync({ compress: quality, format: SaveFormat.JPEG });
}
