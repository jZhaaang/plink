import { Image, TouchableOpacity, View } from 'react-native';

type Props = {
  imageUrls: string[];
  onPressImage?: (index: number) => void;
};

export default function PhotoPreviewGrid({ imageUrls, onPressImage }: Props) {
  if (imageUrls.length === 0) return null;

  return (
    <View className="flex-row gap-2 px-4 mb-4">
      {imageUrls.slice(0, 3).map((url, i) => (
        <TouchableOpacity key={i} onPress={() => onPressImage?.(i)} className="flex-1">
          <Image source={{ uri: url }} className="w-full h-24 rounded-md" resizeMode="cover" />
        </TouchableOpacity>
      ))}
    </View>
  );
}
