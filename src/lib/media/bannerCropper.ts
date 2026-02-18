import ImageCropPicker, { type Image } from 'react-native-image-crop-picker';
import { File, Paths } from 'expo-file-system';

export type CroppedBannerAsset = {
  uri: string;
  width: number;
  height: number;
  mime: string;
  size: number | null;
};

const TARGET_WIDTH = 2500;
const TARGET_HEIGHT = 1000; // 2.5 : 1 aspect ratio

function toCroppedAsset(image: Image): CroppedBannerAsset {
  return {
    uri: image.path.startsWith('file://') ? image.path : `file://${image.path}`,
    width: image.width,
    height: image.height,
    mime: image.mime,
    size: image.size ?? null,
  };
}

export async function pickPartyBannerFromLibrary(): Promise<CroppedBannerAsset | null> {
  try {
    const image = await ImageCropPicker.openPicker({
      mediaType: 'photo',
      cropping: true,
      width: TARGET_WIDTH,
      height: TARGET_HEIGHT,
      forceJpg: true,
      cropperToolbarTitle: 'Crop Party Banner',
      compressImageQuality: 0.7,
    });
    return toCroppedAsset(image);
  } catch {
    throw new Error('Error cropping image.');
  }
}

export async function cropLinkBannerFromUrl(
  signedImageUrl: string,
): Promise<CroppedBannerAsset | null> {
  try {
    const destination = new File(Paths.cache, `link-banner-${Date.now()}.jpg`);
    const downloaded = await File.downloadFileAsync(
      signedImageUrl,
      destination,
    );

    if (!downloaded.exists) {
      throw new Error('Failed to download image for cropping.');
    }

    const image = await ImageCropPicker.openCropper({
      mediaType: 'photo',
      path: downloaded.uri,
      width: TARGET_WIDTH,
      height: TARGET_HEIGHT,
      forceJpg: true,
      cropperToolbarTitle: 'Crop Link Banner',
    });

    return toCroppedAsset(image);
  } catch {
    return null;
  }
}
