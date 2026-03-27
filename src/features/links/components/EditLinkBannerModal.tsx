import { useEffect, useState } from 'react';
import { LinkPostMedia } from '../../../lib/models';
import { cropLinkBannerFromUrl } from '../../../lib/media/cropper';
import { Button, Modal, ModalHeader, Spinner } from '../../../components';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface Props {
  visible: boolean;
  onClose: () => void;
  images: LinkPostMedia[];
  initialPath: string | null;
  saving?: boolean;
  onSave: (croppedUri: string) => Promise<void>;
}

export default function EditLinkBannerModal({
  visible,
  onClose,
  images,
  initialPath,
  saving = false,
  onSave,
}: Props) {
  const { theme } = useUnistyles();

  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [croppedUri, setCroppedUri] = useState<string | null>(null);
  const [cropping, setCropping] = useState(false);

  const isBusy = saving || cropping;

  useEffect(() => {
    if (!visible) return;

    const preferredImage =
      images.find((image) => image.path === initialPath) ?? null;
    setSelectedPath(preferredImage?.path ?? null);
    setCroppedUri(null);
    setCropping(false);
  }, [visible, images, initialPath]);

  const handleSelectImage = async (image: LinkPostMedia) => {
    if (cropping) return;

    const prevPath = selectedPath;
    const prevCroppedUri = croppedUri;

    setCropping(true);
    setSelectedPath(image.path);
    setCroppedUri(null);

    try {
      const cropped = await cropLinkBannerFromUrl(image.url);
      if (cropped) {
        setCroppedUri(cropped.uri);
      } else {
        setSelectedPath(prevPath);
        setCroppedUri(prevCroppedUri);
      }
    } finally {
      setCropping(false);
    }
  };

  const handleSave = async () => {
    if (!croppedUri || isBusy) return;
    await onSave(croppedUri);
  };

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      animationType="slide"
      contentStyle={styles.modalContent}
      disableBackdropDismiss={isBusy}
      scrollEnabled={false}
    >
      <ModalHeader title="Pick a Link Banner" onClose={onClose} />

      {cropping ? (
        <View style={styles.previewCard}>
          <View
            style={[
              styles.previewBanner,
              { alignItems: 'center', justifyContent: 'center' },
            ]}
          >
            <Spinner />
            <Text style={styles.croppingText}>Cropping...</Text>
          </View>
        </View>
      ) : croppedUri ? (
        <View style={styles.previewCard}>
          <View style={styles.previewBanner}>
            <Image
              source={{ uri: croppedUri }}
              contentFit="cover"
              style={{ width: '100%', height: '100%' }}
              transition={150}
            />
          </View>
        </View>
      ) : (
        <View style={styles.emptyCard}>
          <View style={styles.emptyIcon}>
            <Feather
              name={images.length > 0 ? 'crop' : 'image'}
              size={theme.iconSizes.md}
              color={theme.colors.gray}
            />
          </View>
          <Text style={styles.emptyText}>
            {images.length > 0
              ? 'Tap a photo to crop'
              : 'Add photos to this link before setting a banner'}
          </Text>
        </View>
      )}

      {images.length > 0 ? (
        <View style={styles.thumbnailSection}>
          <Text style={styles.thumbnailLabel}>Link Photos</Text>
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
                  onPress={() => handleSelectImage(image)}
                >
                  <View
                    style={[
                      styles.thumbnail,
                      isSelected && styles.thumbnailSelected,
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
              );
            })}
          </ScrollView>
        </View>
      ) : null}

      <View style={styles.actions}>
        <Button
          title="Cancel"
          variant="outline"
          onPress={onClose}
          style={{ flex: 1 }}
          disabled={isBusy}
        />
        <Button
          title="Save Banner"
          onPress={handleSave}
          style={{ flex: 1 }}
          loading={isBusy}
          disabled={!croppedUri || isBusy}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create((theme) => ({
  modalContent: {
    width: '94%',
    borderRadius: 24,
    overflow: 'hidden',
  },
  body: {
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
    backgroundColor: theme.colors.surface,
  },
  previewCard: {
    borderRadius: theme.radii.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  previewBanner: {
    width: '100%',
    backgroundColor: theme.colors.background,
    aspectRatio: 2.5,
  },
  emptyCard: {
    borderRadius: theme.radii.xl,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing['2xl'],
    alignItems: 'center',
    aspectRatio: 2.5,
  },
  emptyIcon: {
    width: 48,
    height: 48,
    borderRadius: theme.radii.full,
    backgroundColor: theme.colors.surfacePressed,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.sm,
  },
  emptyText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.iconSecondary,
    textAlign: 'center',
  },
  thumbnailSection: {
    marginTop: theme.spacing.lg,
  },
  thumbnailLabel: {
    fontSize: theme.fontSizes.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    color: theme.colors.textPlaceholder,
    marginBottom: theme.spacing.sm,
  },
  thumbnail: {
    width: 84,
    height: 84,
    borderRadius: theme.radii.lg,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: theme.colors.borderInput,
  },
  thumbnailSelected: {
    borderColor: theme.colors.info,
  },
  actions: {
    marginTop: theme.spacing.xl,
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  croppingText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textTertiary,
    marginTop: theme.spacing.sm,
  },
}));
