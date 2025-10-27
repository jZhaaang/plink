import { useEffect, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Button, Modal, TextField } from '../../../components';
import { Pressable, Text, View } from 'react-native';
import PartyDetail from './PartyDetail';

type Props = {
  visible: boolean;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (
    name: string,
    avatarUri: string | null,
    bannerUri: string | null,
  ) => Promise<void>;
};

const ASPECT: Record<'avatar' | 'banner', [number, number]> = {
  avatar: [1, 1],
  banner: [3, 1],
};

export default function CreatePartyModal({
  visible,
  loading,
  onClose,
  onSubmit,
}: Props) {
  const [name, setName] = useState('');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [bannerUri, setBannerUri] = useState<string | null>(null);
  const [localLoading, setLocalLoading] = useState(false);

  useEffect(() => {
    ImagePicker.requestMediaLibraryPermissionsAsync();
  }, []);

  const choosePhoto = async (type: 'avatar' | 'banner') => {
    const aspect = ASPECT[type];
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect,
    });
    if (result.canceled) return;
    const uri = result.assets[0].uri;
    if (type === 'avatar') setAvatarUri(uri);
    else setBannerUri(uri);
  };

  const handleSubmit = async () => {
    setLocalLoading(true);
    try {
      await onSubmit(name.trim(), avatarUri, bannerUri);
    } finally {
      setLocalLoading(false);
    }
  };

  return (
    <Modal visible={visible} onClose={onClose} animationType="slide">
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-lg font-semibold">Create Party</Text>
        <Pressable onPress={onClose} className="p-2">
          <Text className="text-neutral-500">Close</Text>
        </Pressable>
      </View>

      <Text className="text-xs font-semibold uppercase tracking-wide text-neutral-500 px-1">
        Preview
      </Text>

      <PartyDetail
        name={name || 'Party Name'}
        avatarUri={avatarUri}
        bannerUri={bannerUri}
        onPressAvatar={() => choosePhoto('avatar')}
        onPressBanner={() => choosePhoto('banner')}
        mode="preview"
      />

      <View className="mt-4 gap-2">
        <TextField
          header="Party Name"
          value={name}
          onChangeText={setName}
          placeholder="e.g. Backstreet Boys"
          className="text-base"
          autoCapitalize="words"
          maxLength={30}
          returnKeyType="done"
        />

        <View className="mt-6">
          <Button
            title="Create Party"
            size="lg"
            onPress={handleSubmit}
            loading={loading || localLoading}
          />
        </View>
      </View>
    </Modal>
  );
}
