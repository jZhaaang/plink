import { Pressable, View } from 'react-native';
import { Image } from 'expo-image';
import { Feather } from '@expo/vector-icons';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { Row, Text } from '../../../components';
import { LinkMedia } from '../../../lib/models';

interface SelectionPillProps {
  selectedMedia: Map<string, LinkMedia>;
  onSetLocation: () => void;
  onDelete: () => Promise<void>;
  onCancel: () => void;
}

export default function SelectionPill({
  selectedMedia,
  onSetLocation,
  onDelete,
  onCancel,
}: SelectionPillProps) {
  const { theme } = useUnistyles();

  const items = Array.from(selectedMedia.values());
  const preview = items.slice(0, 3);
  const count = selectedMedia.size;

  return (
    <Row align="center" style={styles.pill}>
      <Row align="center" gap="sm" style={{ flex: 1 }}>
        <Row>
          {preview.map((item, i) => (
            <View
              key={item.id}
              style={[
                styles.thumbnail,
                { marginLeft: i === 0 ? 0 : -16, zIndex: 10 - i },
              ]}
            >
              <Image
                source={{ uri: item.thumbnailUrl ?? item.url }}
                style={{ width: '100%', height: '100%' }}
                contentFit="cover"
              />
            </View>
          ))}
        </Row>
        <Text variant="labelMd" color="primary">
          {count} selected
        </Text>
      </Row>

      <View style={styles.divider} />

      <Row align="center" gap="lg">
        <Pressable onPress={onSetLocation} hitSlop={10}>
          <Feather name="map-pin" size={19} color={theme.colors.accentText} />
        </Pressable>
        <Pressable onPress={onDelete} hitSlop={10}>
          <Feather name="trash-2" size={19} color={theme.colors.error} />
        </Pressable>
      </Row>

      <View style={styles.divider} />

      <Pressable onPress={onCancel} hitSlop={10}>
        <Feather name="x" size={19} color={theme.colors.textSecondary} />
      </Pressable>
    </Row>
  );
}

const styles = StyleSheet.create((theme) => ({
  pill: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.full,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    ...theme.shadows.lg,
  },
  thumbnail: {
    width: theme.iconSizes.xl,
    height: theme.iconSizes.xl,
    borderRadius: theme.radii.full,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: theme.colors.surface,
  },
  divider: {
    width: 1,
    height: 22,
    backgroundColor: theme.colors.border,
    marginHorizontal: theme.spacing.md,
  },
}));
