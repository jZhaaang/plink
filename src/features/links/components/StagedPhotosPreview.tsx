import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Pressable, ScrollView, View } from 'react-native';
import { Image } from 'expo-image';

type Props = {
  assets: ImagePicker.ImagePickerAsset[];
  onAddFromGallery: () => void;
  onRemove: (uri: string) => void;
};

export function StagedPhotosPreview({
  assets,
  onAddFromGallery,
  onRemove,
}: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 8 }}
    >
      {assets.map((asset) => (
        <View key={asset.uri} className="relative">
          <Image
            source={{ uri: asset.uri }}
            style={{ width: 80, height: 80, borderRadius: 8 }}
            contentFit="cover"
          />
          {/* Remove button */}
          <Pressable
            onPress={() => onRemove(asset.uri)}
            className="absolute top-1 right-1 w-6 h-6 bg-slate-800 rounded-full items-center justify-center"
            hitSlop={8}
          >
            <Feather name="x" size={14} color="white" />
          </Pressable>
        </View>
      ))}

      <Pressable
        onPress={onAddFromGallery}
        className="w-20 h-22 rounded-lg border-2 border-dashed border-slate-300 items-center justify-center"
      >
        <Feather name="plus" size={24} color="#94a3b8" />
      </Pressable>
    </ScrollView>
  );
}
