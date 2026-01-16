import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Pressable, ScrollView, View } from 'react-native';
import { Image } from 'expo-image';

type Props = {
  assets: ImagePicker.ImagePickerAsset[];
  onRemove: (uri: string) => void;
};

export function StagedPhotosPreview({ assets, onRemove }: Props) {
  if (assets.length === 0) return null;

  return (
    <View className="border-t border-slate-200 bg-white px-4 pt-3 pb-2">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8 }}
      >
        {assets.map((asset) => (
          <View key={asset.uri} className="relative">
            <Image
              source={{ uri: asset.uri }}
              className="w-20 h-20 rounded-lg"
              contentFit="cover"
            />
            {/* Remove button */}
            <Pressable
              onPress={() => onRemove(asset.uri)}
              className="absolute -top-2 -right-2 w-6 h-6 bg-slate-800 rounded-full items-center justify-center"
              hitSlop={8}
            >
              <Feather name="x" size={14} color="white" />
            </Pressable>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
