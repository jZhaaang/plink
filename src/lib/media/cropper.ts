import ImageCropPicker, { type Image } from 'react-native-image-crop-picker';
import { File, Paths } from 'expo-file-system';

export type CroppedAsset = {
  uri: string;
  width: number;
  height: number;
  mime: string;
  size: number | null;
};

const AVATAR_SIZE = 512;
const BANNER_WIDTH = 2500;
const BANNER_HEIGHT = 1000; // 2.5 : 1 aspect ratio

function toCroppedAsset(image: Image): CroppedAsset {
  return {
    uri: image.path.startsWith('file://') ? image.path : `file://${image.path}`,
    width: image.width,
    height: image.height,
    mime: image.mime,
    size: image.size ?? null,
  };
}

export async function pickPartyAvatarFromLibrary(): Promise<CroppedAsset | null> {
  try {
    const image = await ImageCropPicker.openPicker({
      mediaType: 'photo',
      cropping: true,
      width: AVATAR_SIZE,
      height: AVATAR_SIZE,
      forceJpg: true,
      cropperToolbarTitle: 'Crop Party Avatar',
      compressImageQuality: 0.7,
      cropperCircleOverlay: true,
    });
    return toCroppedAsset(image);
  } catch (err) {
    if (err?.code === 'E_PICKER_CANCELLED') return null;
    throw new Error('Error cropping party avatar.');
  }
}

export async function pickPartyBannerFromLibrary(): Promise<CroppedAsset | null> {
  try {
    const image = await ImageCropPicker.openPicker({
      mediaType: 'photo',
      cropping: true,
      width: BANNER_WIDTH,
      height: BANNER_HEIGHT,
      forceJpg: true,
      cropperToolbarTitle: 'Crop Party Banner',
      compressImageQuality: 0.7,
    });
    return toCroppedAsset(image);
  } catch (err) {
    if (err?.code === 'E_PICKER_CANCELLED') return null;
    throw new Error('Error cropping party banner.');
  }
}

export async function cropLinkBannerFromUrl(
  signedImageUrl: string,
): Promise<CroppedAsset | null> {
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
      width: BANNER_WIDTH,
      height: BANNER_HEIGHT,
      forceJpg: true,
      cropperToolbarTitle: 'Crop Link Banner',
    });

    return toCroppedAsset(image);
  } catch (err) {
    if (err?.code === 'E_PICKER_CANCELLED') return null;
    throw new Error('Error cropping link banner.');
  }
}
