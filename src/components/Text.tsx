import { Text as RNText, TextProps, TextStyle } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

type TextVariant =
  keyof (typeof import('../styles/theme').lightTheme)['textStyles'];
type TextColor =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'placeholder'
  | 'inverse'
  | 'inverseMuted'
  | 'error'
  | 'success'
  | 'accent'
  | 'warning';

interface AppTextProps extends Omit<TextProps, 'style'> {
  variant?: TextVariant;
  color: TextColor;
  style?: TextStyle | TextStyle[];
}

export default function Text({
  variant = 'bodyMd',
  color = 'primary',
  style,
  ...rest
}: AppTextProps) {
  const { theme } = useUnistyles();
  styles.useVariants({ color });

  return (
    <RNText style={[theme.textStyles[variant], styles.text, style]} {...rest} />
  );
}

const styles = StyleSheet.create((theme) => ({
  text: {
    variants: {
      color: {
        primary: { color: theme.colors.textPrimary },
        secondary: { color: theme.colors.textSecondary },
        tertiary: { color: theme.colors.textTertiary },
        placeholder: { color: theme.colors.textPlaceholder },
        inverse: { color: theme.colors.textInverse },
        inverseMuted: { color: theme.colors.textInverseMuted },
        error: { color: theme.colors.error },
        success: { color: theme.colors.success },
        accent: { color: theme.colors.accentText },
        warning: { color: theme.colors.warning },
      },
    },
  },
}));
