import { View, ViewProps, ViewStyle } from 'react-native';
import { Text } from './';
import { StyleSheet } from 'react-native-unistyles';

interface SectionHeaderProps extends Omit<ViewProps, 'style'> {
  title: string;
  count?: number;
  action?: React.ReactNode;
  style?: ViewStyle;
}

export default function SectionHeader({
  title,
  count = null,
  action,
  style,
  ...rest
}: SectionHeaderProps) {
  return (
    <View {...rest} style={[styles.container, style]}>
      <View style={styles.left}>
        <Text variant="headingMd" color="primary" numberOfLines={1}>
          {title}
        </Text>
        {count != null && (
          <View style={styles.badge}>
            <Text variant="labelSm" color="secondary">
              {count}
            </Text>
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
    gap: theme.spacing.sm,
  },
  badge: {
    backgroundColor: theme.colors.surfacePressed,
    borderRadius: theme.radii.full,
    paddingHorizontal: theme.spacing.sm,
  },
}));
