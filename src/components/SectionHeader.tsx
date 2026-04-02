import { View, ViewProps, ViewStyle } from 'react-native';
import { Row, Text } from './';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

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
  const { theme } = useUnistyles();

  return (
    <Row
      {...rest}
      justify="space-between"
      align="center"
      gap="sm"
      style={[{ marginBottom: theme.spacing.md }, style]}
    >
      <Row align="center" gap="xs">
        <Text variant="headingMd" color="primary">
          {title}
        </Text>
        {count != null && (
          <View style={styles.badge}>
            <Text variant="labelSm" color="secondary">
              {count}
            </Text>
          </View>
        )}
      </Row>
      {action}
    </Row>
  );
}

const styles = StyleSheet.create((theme) => ({
  badge: {
    backgroundColor: theme.colors.surfacePressed,
    borderRadius: theme.radii.full,
    paddingHorizontal: theme.spacing.sm,
  },
}));
