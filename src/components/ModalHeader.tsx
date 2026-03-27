import { Feather } from '@expo/vector-icons';
import { View, Text, Pressable } from 'react-native';
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
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
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
  closeIcon: {
    color: theme.colors.textSecondary,
  },
}));
