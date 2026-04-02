import { View, ViewProps, ViewStyle } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { Text } from './';

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
  const { theme } = useUnistyles();

  return (
    <View {...rest} style={[styles.container, style]}>
      {icon && (
        <View style={styles.iconWrapper}>
          <Feather
            name={icon}
            size={theme.iconSizes.lg}
            color={theme.colors.gray}
          />
        </View>
      )}
      <Text variant="labelMd" color="secondary">
        {title}
      </Text>
      {message && (
        <Text variant="bodySm" color="tertiary">
          {message}
        </Text>
      )}
      {action && <View style={styles.actionWrapper}>{action}</View>}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    alignItems: 'center',
    paddingVertical: theme.spacing['2xl'],
    paddingHorizontal: theme.spacing.lg,
  },
  iconWrapper: {
    backgroundColor: theme.colors.surfacePressed,
    borderRadius: theme.radii.full,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  actionWrapper: {
    marginTop: theme.spacing.lg,
  },
}));
