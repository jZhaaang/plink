import { Feather } from '@expo/vector-icons';
import { View, Pressable } from 'react-native';
import { Text } from './';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface Props {
  title: string;
  subtitle?: string;
  onClose: () => void;
  disabled?: boolean;
}

export default function ModalHeader({
  title,
  subtitle,
  onClose,
  disabled = false,
}: Props) {
  const { theme } = useUnistyles();

  return (
    <View style={styles.header}>
      <View style={styles.titleGroup}>
        <Text variant="headingLg" color="primary">
          {title}
        </Text>
        {subtitle ? (
          <Text variant="bodyMd" color="tertiary">
            {subtitle}
          </Text>
        ) : null}
      </View>

      <Pressable
        onPress={onClose}
        disabled={disabled}
        hitSlop={8}
        style={({ pressed }) => ({
          opacity: pressed ? theme.opacity.pressed : 1,
        })}
      >
        <View style={styles.closeCircle}>
          <Feather name="x" size={18} color={styles.closeIcon.color} />
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
  },
  titleGroup: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  closeCircle: {
    width: 36,
    height: 36,
    borderRadius: theme.radii.full,
    backgroundColor: theme.colors.surfacePressed,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIcon: {
    color: theme.colors.textSecondary,
  },
}));
