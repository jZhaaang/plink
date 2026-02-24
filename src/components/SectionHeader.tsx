import { View, Text, ViewProps, ViewStyle } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

interface SectionHeaderProps extends Omit<ViewProps, 'style'> {
  title: string;
  count?: number;
  action?: React.ReactNode;
  style?: ViewStyle;
}

export default function SectionHeader({
  title,
  count,
  action,
  style,
  ...rest
}: SectionHeaderProps) {
  return (
    <View {...rest} style={[styles.container, style]}>
      <View style={styles.left}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {count !== undefined && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{count}</Text>
          </View>
        )}
      </View>
      {action}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: theme.fontSizes.base,
    fontWeight: theme.fontWeights.semibold,
    color: theme.colors.textPrimary,
    marginRight: theme.spacing.sm,
  },
  badge: {
    backgroundColor: theme.colors.surfacePressed,
    borderRadius: theme.radii.full,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.iconSecondary,
  },
}));
