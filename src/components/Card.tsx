import { View, ViewProps, ViewStyle } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

interface CardProps extends Omit<ViewProps, 'style'> {
  style?: ViewStyle;
}

interface CardSectionProps extends Omit<ViewProps, 'style'> {
  style?: ViewStyle;
}

export default function Card({ style, ...rest }: CardProps) {
  return <View {...rest} style={[styles.card, style]} />;
}

export function CardSection({ style, ...rest }: CardSectionProps) {
  return <View {...rest} style={[styles.section, style]} />;
}

const styles = StyleSheet.create((theme) => ({
  card: {
    borderRadius: theme.radii.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
  },
  section: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.md,
  },
}));
