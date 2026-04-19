import { useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import {
  Button,
  Modal,
  ModalHeader,
  TextField,
  Spinner,
} from '../../../components';
import LocationPicker, { StagedLocation } from './LocationPicker';
import { cropLinkBannerFromUrl } from '../../../lib/media/cropper';
import { LinkDetail, LinkMedia, LinkPostMedia } from '../../../lib/models';

export type EditLinkChanges = {
  name: string;
  bannerUri: string | null;
  locations: StagedLocation[];
};

interface EditLinkModalProps {
  visible: boolean;
  link: LinkDetail;
  images: LinkMedia[];
  saving?: boolean;
  onClose: () => void;
  onSave: (changes: EditLinkChanges) => void;
}

export default function EditLinkModal({
  visible,
  link,
  images,
  saving = false,
  onClose,
  onSave,
}: EditLinkModalProps) {
  const { theme } = useUnistyles();

  const [name, setName] = useState(link.name);
  const [locations, setLocations] = useState<StagedLocation[]>(link.locations);
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [stagedBannerUri, setStagedBannerUri] = useState<string | null>(null);
  const [cropping, setCropping] = useState(false);

  const isBusy = saving || cropping;

  useEffect(() => {
    if (!visible) return;
    setName(link.name);
    setLocations(link.locations);
    setStagedBannerUri(null);
    setCropping(false);
    // highlight the thumbnail that matches the current banner
    const match = images.find((img) => img.path === link.banner_path) ?? null;
    setSelectedPath(match?.path ?? null);
  }, [visible]);

  const handleSelectImage = async (image: LinkMedia) => {
    if (cropping) return;

    const prevPath = selectedPath;
    const prevUri = stagedBannerUri;

    setCropping(true);
    setSelectedPath(image.path);
    setStagedBannerUri(null);

    try {
      const cropped = await cropLinkBannerFromUrl(image.url);
      if (cropped) {
        setStagedBannerUri(cropped.uri);
      } else {
        setSelectedPath(prevPath);
        setStagedBannerUri(prevUri);
      }
    } finally {
      setCropping(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim() || isBusy) return;
    await onSave({ name: name.trim(), bannerUri: stagedBannerUri, locations });
  };

  const handleClose = () => {
    if (isBusy) return;
    onClose();
  };

  const displayBannerUri = stagedBannerUri ?? link.bannerUrl ?? null;
  const nameChanged = name.trim() !== link.name;
  const bannerChanged = stagedBannerUri !== null;
  const locationsChanged =
    locations.length !== link.locations.length ||
    locations.some(
      (location, i) => location.mapbox_id !== link.locations[i]?.mapbox_id,
    );
  const hasChanges = nameChanged || bannerChanged || locationsChanged;

  return (
    <Modal
      visible={visible}
      onClose={handleClose}
      animationType="fade"
      disableBackdropDismiss={isBusy}
      contentStyle={{ width: '94%' }}
      scrollEnabled
    >
      <ModalHeader title="Edit Link" onClose={handleClose} disabled={isBusy} />

      {/* Banner */}
      <View style={styles.section}>
        <>
          <Text style={styles.sectionLabel}>Banner</Text>
          {cropping ? (
            <View style={[styles.bannerCard, styles.bannerCardFallback]}>
              <Spinner />
              <Text style={styles.croppingText}>Cropping...</Text>
            </View>
          ) : displayBannerUri ? (
            <View style={styles.bannerCard}>
              <Image
                source={{ uri: displayBannerUri }}
                contentFit="cover"
                style={{ width: '100%', height: '100%' }}
                transition={200}
              />
              {stagedBannerUri && (
                <View style={styles.newChip}>
                  <Feather
                    name="check"
                    size={theme.iconSizes.xs}
                    color={theme.colors.white}
                  />
                  <Text style={styles.newChipText}>New</Text>
                </View>
              )}
            </View>
          ) : (
            <View style={[styles.bannerCard, styles.bannerCardFallback]}>
              <View style={styles.bannerEmptyIcon}>
                <Feather name={images.length > 0 ? 'crop' : 'image'} />
              </View>
              <Text style={styles.bannerEmptyText}>
                {images.length > 0
                  ? 'Tap a photo below to set a banner'
                  : 'Add photos to this link to set a banner'}
              </Text>
            </View>
          )}
        </>

        {images.length > 0 && (
          <>
            <Text style={styles.thumbnailLabel}>Choose from Link Photos</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={true}
              contentContainerStyle={styles.thumbnailContainer}
            >
              {images.map((image) => (
                <Pressable
                  key={image.id}
                  onPress={() => handleSelectImage(image)}
                  disabled={cropping}
                >
                  <View
                    style={[
                      styles.thumbnail,
                      image.path === selectedPath && styles.thumbnailSelected,
                    ]}
                  >
                    <Image
                      source={{ uri: image.url }}
                      cachePolicy="memory-disk"
                      contentFit="cover"
                      style={{ width: '100%', height: '100%' }}
                    />
                  </View>
                </Pressable>
              ))}
            </ScrollView>
          </>
        )}
      </View>

      {/* Name */}
      <View style={styles.section}>
        <TextField
          header="Link Name"
          value={name}
          onChangeText={setName}
          placeholder="Enter a link name"
          autoCapitalize="words"
          maxLength={30}
          returnKeyType="done"
        />
      </View>

      {/* Locations */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Locations</Text>
        <LocationPicker locations={locations} onChange={setLocations} />
      </View>

      {/* Actions */}
      <Button
        title="Save Changes"
        size="md"
        onPress={handleSave}
        loading={saving}
        disabled={!name.trim() || !hasChanges || isBusy}
      />
    </Modal>
  );
}

const styles = StyleSheet.create((theme) => ({
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionLabel: {
    fontSize: theme.fontSizes.xs,
    fontWeight: theme.fontWeights.medium,
    color: theme.colors.iconSecondary,
    marginBottom: theme.spacing.xs,
  },
  bannerCard: {
    width: '100%',
    aspectRatio: 2.5,
    borderRadius: theme.radii.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  bannerCardFallback: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.background,
    gap: theme.spacing.sm,
  },
  bannerEmptyIcon: {
    width: theme.iconSizes.xl,
    height: theme.iconSizes.xl,
    borderRadius: theme.radii.full,
    backgroundColor: theme.colors.surfacePressed,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerEmptyText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.iconSecondary,
    textAlign: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  newChip: {
    position: 'absolute',
    top: theme.spacing.sm,
    right: theme.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radii.full,
    backgroundColor: theme.colors.success,
  },
  newChipText: {
    fontSize: theme.fontSizes.xs,
    fontWeight: theme.fontWeights.semibold,
    color: theme.colors.white,
  },
  croppingText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textTertiary,
  },
  thumbnailLabel: {
    fontSize: theme.fontSizes.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    color: theme.colors.textPlaceholder,
    marginVertical: theme.spacing.sm,
  },
  thumbnailContainer: {
    gap: theme.spacing.xs,
    paddingRight: theme.spacing.xs,
  },
  thumbnail: {
    width: 64,
    height: 64,
    borderRadius: theme.radii.lg,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: theme.colors.borderInput,
  },
  thumbnailSelected: {
    borderColor: theme.colors.info,
  },
  actions: {
    marginTop: theme.spacing['2xl'],
  },
}));
