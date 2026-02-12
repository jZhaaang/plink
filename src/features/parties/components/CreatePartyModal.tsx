import { useEffect, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Button, Modal, TextField } from '../../../components';
import { Pressable, Text, View, ImageBackground } from 'react-native';
import { Party } from '../../../lib/models';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

type Props = {
  visible: boolean;
  initialParty?: Party;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (name: string, bannerUri: string | null) => Promise<void>;
};

export default function CreatePartyModal({
  visible,
  initialParty,
  loading,
  onClose,
  onSubmit,
}: Props) {
  const isEditMode = !!initialParty;

  const [name, setName] = useState(initialParty?.name ?? '');
  const [bannerUri, setBannerUri] = useState<string | null>(
    initialParty?.bannerUrl ?? null,
  );
  const [localLoading, setLocalLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      setName(initialParty?.name ?? '');
      setBannerUri(initialParty?.bannerUrl ?? null);
    }
  }, [visible, initialParty]);

  const chooseBanner = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [2.5, 1],
    });
    if (result.canceled) return;
    const uri = result.assets[0].uri;
    setBannerUri(uri);
  };

  const handleSubmit = async () => {
    setLocalLoading(true);
    try {
      await onSubmit(name.trim(), bannerUri);
    } finally {
      setLocalLoading(false);
    }
  };

  const handleClose = () => {
    if (isEditMode) {
      setName(initialParty?.name ?? '');
      setBannerUri(initialParty?.bannerUrl ?? null);
    }
    onClose();
  };

  const hasChanges =
    name.trim() !== (initialParty?.name ?? '') ||
    bannerUri !== (initialParty?.bannerUrl ?? null);

  return (
    <Modal visible={visible} onClose={handleClose} animationType="slide">
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-lg font-semibold">
          {isEditMode ? 'Edit Party' : 'Create Party'}
        </Text>
        <Pressable onPress={handleClose} className="p-2">
          <Text className="text-neutral-500">Close</Text>
        </Pressable>
      </View>

      {/* Banner picker */}
      <Pressable
        onPress={chooseBanner}
        className="rounded-xl overflow-hidden"
        style={{ aspectRatio: 2.5 }}
      >
        {bannerUri ? (
          <ImageBackground
            source={{ uri: bannerUri }}
            className="flex-1 items-center justify-center"
          >
            <View className="flex-1 w-full bg-black/20 items-center justify-center">
              <MaterialIcons name="edit" size={24} color="#ffffffcc" />
            </View>
          </ImageBackground>
        ) : (
          <LinearGradient
            colors={['#bfdbfe', '#3b82f6']}
            start={{ x: 0, y: 1 }}
            end={{ x: 1, y: 0 }}
            className="flex-1 items-center justify-center"
          >
            <MaterialIcons
              name="add-photo-alternate"
              size={36}
              color="#ffffff99"
            />
            <Text className="text-white/60 text-xs mt-1" numberOfLines={1}>
              Add Banner
            </Text>
          </LinearGradient>
        )}
      </Pressable>

      <View className="mt-4 gap-2">
        <TextField
          header="Party Name"
          left={
            <MaterialCommunityIcons
              name="party-popper"
              size={18}
              color="#64748b"
            />
          }
          value={name}
          onChangeText={setName}
          className="text-base"
          autoCapitalize="words"
          maxLength={30}
          returnKeyType="done"
        />

        <View className="mt-6">
          <Button
            title={isEditMode ? 'Save Changes' : 'Create Party'}
            size="lg"
            onPress={handleSubmit}
            loading={loading || localLoading}
            disabled={!name.trim() || (isEditMode && !hasChanges)}
          />
        </View>
      </View>
    </Modal>
  );
}
