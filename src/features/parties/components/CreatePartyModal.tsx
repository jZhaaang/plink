import { useEffect, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Button, Modal, ModalHeader, TextField } from '../../../components';
import { Pressable, View } from 'react-native';
import { Image } from 'expo-image';
import { Party } from '../../../lib/models';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import {
  pickPartyAvatarFromLibrary,
  pickPartyBannerFromLibrary,
} from '../../../lib/media/cropper';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface Props {
  visible: boolean;
  initialParty?: Party;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (
    name: string,
    avatarUri: string | null,
    bannerUri: string | null,
  ) => Promise<void>;
}

export default function CreatePartyModal({
  visible,
  initialParty,
  loading,
  onClose,
  onSubmit,
}: Props) {
  const { theme } = useUnistyles();

  const [name, setName] = useState(initialParty?.name ?? '');
  const [avatarUri, setAvatarUri] = useState<string | null>(
    initialParty?.avatarUrl ?? null,
  );
  const [bannerUri, setBannerUri] = useState<string | null>(
    initialParty?.bannerUrl ?? null,
  );
  const [localLoading, setLocalLoading] = useState(false);

  const isEditMode = !!initialParty;

  useEffect(() => {
    if (visible) {
      setName(initialParty?.name ?? '');
      setAvatarUri(initialParty?.avatarUrl ?? null);
      setBannerUri(initialParty?.bannerUrl ?? null);
    }
  }, [visible, initialParty]);

  const chooseAvatar = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;

    const cropped = await pickPartyAvatarFromLibrary();
    if (!cropped) return;
    setAvatarUri(cropped.uri);
  };

  const chooseBanner = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;

    const cropped = await pickPartyBannerFromLibrary();
    if (!cropped) return;
    setBannerUri(cropped.uri);
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
      setBannerUri(initialParty?.bannerUrl ?? null);
    }
    onClose();
  };

  const hasChanges =
    name.trim() !== (initialParty?.name ?? '') ||
    avatarUri !== (initialParty?.bannerUrl ?? null) ||
    bannerUri !== (initialParty?.bannerUrl ?? null);

  return (
    <Modal visible={visible} onClose={handleClose} animationType="fade">
      <ModalHeader
        title={isEditMode ? 'Edit Party' : 'Create Party'}
        onClose={handleClose}
      />

      {/* Banner picker */}
      <Pressable
        onPress={chooseBanner}
        style={({ pressed }) => ({
          opacity: pressed ? theme.opacity.pressed : 1,
        })}
      >
        <View style={styles.bannerWrap}>
          {bannerUri ? (
            <Image
              source={{ uri: bannerUri }}
              contentFit="cover"
              style={{ width: '100%', height: '100%' }}
            />
          ) : (
            <View style={styles.emptyPicker}>
              <View style={styles.emptyPickerIcon}>
                <MaterialIcons
                  name="add-photo-alternate"
                  size={theme.iconSizes.xl}
                  color={theme.colors.gray}
                />
              </View>
            </View>
          )}
        </View>
      </Pressable>

      {/* Avatar picker */}
      <Pressable
        onPress={chooseAvatar}
        style={({ pressed }) => ({
          opacity: pressed ? theme.opacity.pressed : 1,
        })}
      >
        <View style={styles.avatarWrap}>
          {avatarUri ? (
            <Image
              source={{ uri: avatarUri }}
              contentFit="cover"
              style={{ width: '100%', height: '100%' }}
            />
          ) : (
            <View style={styles.emptyPicker}>
              <MaterialIcons
                name="add-a-photo"
                size={theme.iconSizes.lg}
                color={theme.colors.gray}
              />
            </View>
          )}
        </View>
      </Pressable>

      <View style={styles.formSection}>
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
          placeholder="Enter a party name"
          onChangeText={setName}
          autoCapitalize="words"
          maxLength={30}
          returnKeyType="done"
        />

        <Button
          title={isEditMode ? 'Save Changes' : 'Create Party'}
          size="md"
          onPress={handleSubmit}
          loading={loading || localLoading}
          disabled={!name.trim() || (isEditMode && !hasChanges)}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create((theme) => ({
  emptyPicker: {
    flex: 1,
    backgroundColor: theme.colors.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyPickerIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.sm,
  },
  emptyPickerText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.iconSecondary,
  },
  bannerWrap: {
    borderRadius: theme.radii.xl,
    overflow: 'hidden',
    aspectRatio: 2.5,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  avatarWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
    marginTop: -theme.spacing['3xl'],
    marginLeft: theme.spacing.lg,
    borderWidth: 2,
    borderColor: theme.colors.border,
  },
  formSection: {
    marginTop: theme.spacing.lg,
    gap: theme.spacing.md,
  },
}));
