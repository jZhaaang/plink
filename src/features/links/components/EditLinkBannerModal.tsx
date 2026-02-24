import { useEffect, useMemo, useState } from 'react';
import { LinkPostMedia } from '../../../lib/models';
import { cropLinkBannerFromUrl } from '../../../lib/media/bannerCropper';
import { Button, Modal } from '../../../components';
import { LinearGradient } from 'expo-linear-gradient';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { StyleSheet } from 'react-native-unistyles';

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
      contentStyle={styles.modalContent}
      disableBackdropDismiss={isBusy}
      scrollEnabled={false}
    >
      <LinearGradient
        colors={['#e2f1ff', '#ffffff']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>Edit Link Banner</Text>
            <Text style={styles.subtitle}>
              Pick a photo, then crop to banner ratio
            </Text>
          </View>

          <Pressable onPress={onClose} disabled={isBusy}>
            <View style={styles.closeCircle}>
              <Feather name="x" size={18} color="#334155" />
            </View>
          </Pressable>
        </View>
      </LinearGradient>

      <View style={styles.body}>
        {selectedImage ? (
          <View style={styles.previewCard}>
            <View style={styles.previewBanner}>
              <Image
                source={{ uri: selectedImage.url }}
                contentFit="cover"
                style={{ width: '100%', height: '100%' }}
                transition={150}
                cachePolicy="memory-disk"
              />
              <LinearGradient
                colors={['rgba(2,6,23,0.05)', 'rgba(2,6,23,0.45)']}
                style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
              />
              <View style={styles.previewFooter}>
                <Text style={styles.previewHint}>Final crop opens on Save</Text>
                <View style={styles.ratioBadge}>
                  <Text style={styles.ratioText}>2.5:1</Text>
                </View>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <Feather name="image" size={20} color="#64748b" />
            </View>
            <Text style={styles.emptyText}>
              Add photos to this link before setting a banner.
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
                    onPress={() => setSelectedPath(image.path)}
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
                      {isSelected ? (
                        <View style={styles.checkBadge}>
                          <Feather name="check" size={12} color="#fff" />
                        </View>
                      ) : null}
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
            title={cropping ? 'Cropping...' : 'Crop & Save'}
            onPress={handleSave}
            style={{ flex: 1 }}
            loading={isBusy}
            disabled={!selectedImage || isBusy}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create((theme) => ({
  modalContent: {
    width: '94%',
    borderRadius: 24,
    padding: 0,
    overflow: 'hidden',
  },
  headerGradient: {
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: theme.fontSizes.lg,
    fontWeight: theme.fontWeights.semibold,
    color: theme.colors.textPrimary,
  },
  subtitle: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textTertiary,
    marginTop: 2,
  },
  closeCircle: {
    width: 36,
    height: 36,
    borderRadius: theme.radii.full,
    backgroundColor: theme.colors.surfacePressed,
    alignItems: 'center',
    justifyContent: 'center',
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
    backgroundColor: theme.colors.surfacePressed,
    aspectRatio: 2.5,
  },
  previewFooter: {
    position: 'absolute',
    bottom: theme.spacing.md,
    left: theme.spacing.md,
    right: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  previewHint: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.95)',
    fontWeight: theme.fontWeights.medium,
  },
  ratioBadge: {
    paddingHorizontal: 10,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radii.full,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  ratioText: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.9)',
  },
  emptyCard: {
    borderRadius: theme.radii.xl,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing['2xl'],
    alignItems: 'center',
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
    borderColor: 'transparent',
  },
  thumbnailSelected: {
    borderColor: theme.colors.info,
  },
  checkBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 20,
    height: 20,
    borderRadius: theme.radii.full,
    backgroundColor: theme.colors.info,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actions: {
    marginTop: theme.spacing.xl,
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
}));
