import { View, Text, ViewProps, ViewStyle } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { StyleSheet } from 'react-native-unistyles';

interface EmptyStateProps extends Omit<ViewProps, 'style'> {
  icon?: keyof typeof Feather.glyphMap;
  title: string;
  message?: string;
  action?: React.ReactNode;
  style?: ViewStyle;
}

export default function EmptyState({
  icon,
  title,
  message,
  action,
  style,
  ...rest
}: EmptyStateProps) {
  return (
    <View {...rest} style={[styles.container, style]}>
      {icon && (
        <View style={styles.iconWrapper}>
          <Feather name={icon} size={24} color="#64748b" />
        </View>
      )}
      <Text style={styles.title}>{title}</Text>
      {message && <Text style={styles.message}>{message}</Text>}
      {action && <View style={styles.actionWrapper}>{action}</View>}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: theme.spacing.lg,
  },
  iconWrapper: {
    backgroundColor: theme.colors.surfacePressed,
    borderRadius: theme.radii.full,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: theme.fontSizes.base,
    fontWeight: theme.fontWeights.medium,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  message: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textTertiary,
    textAlign: 'center',
    marginTop: theme.spacing.xs,
  },
  actionWrapper: {
    marginTop: theme.spacing.lg,
  },
}));
