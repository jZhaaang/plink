import { useEffect, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Button, Modal, TextField } from '../../../components';
import { Pressable, Text, View, ImageBackground } from 'react-native';
import { Party } from '../../../lib/models';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { pickPartyBannerFromLibrary } from '../../../lib/media/bannerCropper';
import { StyleSheet } from 'react-native-unistyles';

interface Props {
  visible: boolean;
  initialParty?: Party;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (name: string, bannerUri: string | null) => Promise<void>;
}

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

    const cropped = await pickPartyBannerFromLibrary();
    if (!cropped) return;
    setBannerUri(cropped.uri);
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
    <Modal visible={visible} onClose={handleClose} animationType="fade">
      <View style={styles.header}>
        <Text style={styles.title}>
          {isEditMode ? 'Edit Party' : 'Create Party'}
        </Text>
        <Pressable onPress={handleClose}>
          <View style={styles.closeButton}>
            <Text style={styles.closeText}>Close</Text>
          </View>
        </Pressable>
      </View>

      {/* Banner picker */}
      <Pressable onPress={chooseBanner}>
        <View style={styles.bannerWrap}>
          {bannerUri ? (
            <ImageBackground
              source={{ uri: bannerUri }}
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <View style={styles.bannerOverlay}>
                <MaterialIcons name="edit" size={24} color="#ffffffcc" />
              </View>
            </ImageBackground>
          ) : (
            <LinearGradient
              colors={['#bfdbfe', '#3b82f6']}
              start={{ x: 0, y: 1 }}
              end={{ x: 1, y: 0 }}
              style={{
                width: '100%',
                height: '100%',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <MaterialIcons
                name="add-photo-alternate"
                size={36}
                color="#ffffff99"
              />
              <Text style={styles.addBannerText} numberOfLines={1}>
                Add Banner
              </Text>
            </LinearGradient>
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
          onChangeText={setName}
          autoCapitalize="words"
          maxLength={30}
          returnKeyType="done"
        />

        <View style={styles.submitWrap}>
          <Button
            title={isEditMode ? 'Save Changes' : 'Create Party'}
            size="md"
            onPress={handleSubmit}
            loading={loading || localLoading}
            disabled={!name.trim() || (isEditMode && !hasChanges)}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create((theme) => ({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: theme.fontSizes.lg,
    fontWeight: theme.fontWeights.semibold,
    color: theme.colors.textPrimary,
  },
  closeButton: {
    padding: theme.spacing.sm,
  },
  closeText: {
    color: theme.colors.textTertiary,
  },
  bannerWrap: {
    borderRadius: theme.radii.lg,
    overflow: 'hidden',
    aspectRatio: 2.5,
  },
  bannerOverlay: {
    flex: 1,
    width: '100%',
    backgroundColor: theme.colors.overlayLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBannerText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: theme.fontSizes.xs,
    marginTop: theme.spacing.xs,
  },
  formSection: {
    marginTop: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  submitWrap: {
    marginTop: theme.spacing['2xl'],
  },
}));
