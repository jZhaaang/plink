import { useEffect, useMemo, useState } from 'react';
import { LinkPostMedia } from '../../../lib/models';
import { cropLinkBannerFromUrl } from '../../../lib/media/bannerCropper';
import { Button, Modal } from '../../../components';
import { LinearGradient } from 'expo-linear-gradient';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';

type Props = {
  visible: boolean;
  onClose: () => void;
  images: LinkPostMedia[];
  initialPath: string | null;
  saving?: boolean;
  onSave: (croppedUri: string) => Promise<void>;
};

export default function EditLinkBannerModal({
  visible,
  onClose,
  images,
  initialPath,
  saving = false,
  onSave,
}: Props) {
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [cropping, setCropping] = useState(false);

  useEffect(() => {
    if (!visible) return;

    const preferredImage =
      images.find((image) => image.path === initialPath) ?? images[0] ?? null;
    setSelectedPath(preferredImage?.path ?? null);
  }, [visible, images, initialPath]);

  const selectedImage = useMemo(
    () => images.find((image) => image.path === selectedPath) ?? null,
    [images, selectedPath],
  );

  const isBusy = saving || cropping;

  const handleSave = async () => {
    if (!selectedImage || isBusy) return;

    setCropping(true);
    try {
      const cropped = await cropLinkBannerFromUrl(selectedImage.url);
      if (!cropped) return;
      await onSave(cropped.uri);
    } finally {
      setCropping(false);
    }
  };

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      animationType="slide"
      contentClassName="w-[94%] rounded-3xl p-0 overflow-hidden"
      disableBackdropDismiss={isBusy}
      scrollEnabled={false}
    >
      <LinearGradient
        colors={['#e2f1ff', '#ffffff']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="px-5 pt-5 pb-4 border-b border-slate-100"
      >
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-lg font-semibold text-slate-900">
              Edit Link Banner
            </Text>
            <Text className="text-sm text-slate-500 mt-0.5">
              Pick a photo, then crop to banner ratio
            </Text>
          </View>

          <Pressable
            onPress={onClose}
            disabled={isBusy}
            className="w-9 h-9 rounded-full bg-slate-100 items-center justify-center"
          >
            <Feather name="x" size={18} color="#334155" />
          </Pressable>
        </View>
      </LinearGradient>

      <View className="px-5 pt-4 pb-5 bg-white">
        {selectedImage ? (
          <View className="rounded-2xl overflow-hidden border border-slate-200">
            <View className="w-full bg-slate-100" style={{ aspectRatio: 2.5 }}>
              <Image
                source={{ uri: selectedImage.url }}
                contentFit="cover"
                style={{ width: '100%', height: '100%' }}
                transition={150}
                cachePolicy="memory-disk"
              />
              <LinearGradient
                colors={['rgba(2,6,23,0.05)', 'rgba(2,6,23,0.45)']}
                className="absolute inset-0"
              />
              <View className="absolute bottom-3 left-3 right-3 flex-row items-center justify-between">
                <Text className="text-[11px] text-white/95 font-medium">
                  Final crop opens on Save
                </Text>
                <View className="px-2.5 py-1 rounded-full bg-black/35">
                  <Text className="text-[10px] text-white/90">2.5:1</Text>
                </View>
              </View>
            </View>
          </View>
        ) : (
          <View className="rounded-2xl bg-slate-50 border border-slate-200 p-6 items-center">
            <View className="w-12 h-12 rounded-full bg-slate-100 items-center justify-center mb-2">
              <Feather name="image" size={20} color="#64748b" />
            </View>
            <Text className="text-sm text-slate-600 text-center">
              Add photos to this link before setting a banner.
            </Text>
          </View>
        )}

        {images.length > 0 ? (
          <View className="mt-4">
            <Text className="text-xs uppercase tracking-wide text-slate-400 mb-2">
              Link Photos
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 10, paddingRight: 4 }}
            >
              {images.map((image) => {
                const isSelected = image.path === selectedPath;
                return (
                  <Pressable
                    key={image.id}
                    onPress={() => setSelectedPath(image.path)}
                    className={`rounded-xl overflow-hidden border-2 ${
                      isSelected ? 'border-blue-500' : 'border-transparent'
                    }`}
                    style={{ width: 84, height: 84 }}
                  >
                    <Image
                      source={{ uri: image.url }}
                      contentFit="cover"
                      style={{ width: '100%', height: '100%' }}
                    />
                    {isSelected ? (
                      <View className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-blue-500 items-center justify-center">
                        <Feather name="check" size={12} color="#fff" />
                      </View>
                    ) : null}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        ) : null}

        <View className="mt-5 flex-row gap-3">
          <Button
            title="Cancel"
            variant="outline"
            onPress={onClose}
            className="flex-1"
            disabled={isBusy}
          />
          <Button
            title={cropping ? 'Cropping...' : 'Crop & Save'}
            onPress={handleSave}
            className="flex-1"
            loading={isBusy}
            disabled={!selectedImage || isBusy}
          />
        </View>
      </View>
    </Modal>
  );
}
