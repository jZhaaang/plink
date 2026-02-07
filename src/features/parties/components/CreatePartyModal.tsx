import { useEffect, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Button, Modal, TextField } from '../../../components';
import { Pressable, Text, View } from 'react-native';
import { PartyCard } from './PartyCard';
import { Party } from '../../../lib/models';

type Props = {
  visible: boolean;
  initialParty?: Party;
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
  initialParty,
  loading,
  onClose,
  onSubmit,
}: Props) {
  const isEditMode = !!initialParty;

  const [name, setName] = useState(initialParty?.name ?? '');
  const [avatarUri, setAvatarUri] = useState<string | null>(
    initialParty?.avatarUrl ?? null,
  );
  const [bannerUri, setBannerUri] = useState<string | null>(
    initialParty?.bannerUrl ?? null,
  );
  const [localLoading, setLocalLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      setName(initialParty?.name ?? '');
      setAvatarUri(initialParty?.avatarUrl ?? null);
      setBannerUri(initialParty?.bannerUrl ?? null);
    }
  }, [visible, initialParty]);

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

  const handleClose = () => {
    if (isEditMode) {
      setName(initialParty?.name ?? '');
      setAvatarUri(initialParty?.avatarUrl ?? null);
      setBannerUri(initialParty?.bannerUrl ?? null);
    }
    onClose();
  };

  const hasChanges =
    name.trim() !== (initialParty?.name ?? '') ||
    avatarUri !== (initialParty?.avatarUrl ?? null) ||
    bannerUri !== (initialParty?.bannerUrl ?? null);

  return (
    <Modal visible={visible} onClose={handleClose} animationType="slide">
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-lg font-semibold">
          {isEditMode ? 'Edit Party' : 'Create Party'}
        </Text>
        <Pressable onPress={handleClose} className="p-2">
          <Text className="text-neutral-500">Close</Text>
        </Pressable>
      </View>

      <Text className="text-xs font-semibold uppercase tracking-wide text-neutral-500 px-1">
        Preview
      </Text>

      <PartyCard
        variant="editable"
        name={name || 'Party Name'}
        avatarUri={avatarUri}
        bannerUri={bannerUri}
        onPressAvatar={() => choosePhoto('avatar')}
        onPressBanner={() => choosePhoto('banner')}
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
