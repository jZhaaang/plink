import {
  ActivityIndicator,
  ActivityIndicatorProps,
  View,
  Text,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

type Tone = 'brand' | 'inverse' | 'muted';

interface SpinnerProps {
  size?: ActivityIndicatorProps['size'];
  tone?: Tone;
  style?: StyleProp<ViewStyle>;
}

export function Spinner({
  size = 'small',
  tone = 'brand',
  style,
}: SpinnerProps) {
  const { theme } = useUnistyles();

  const colors: Record<Tone, string> = {
    brand: theme.colors.spinnerBrand,
    inverse: theme.colors.spinnerInverse,
    muted: theme.colors.spinnerMuted,
  };

  return <ActivityIndicator size={size} color={colors[tone]} style={style} />;
}

interface LoadingScreenProps {
  label?: string;
  tone?: Exclude<Tone, 'muted'>;
  style?: StyleProp<ViewStyle>;
}

export function LoadingScreen({
  label,
  tone = 'brand',
  style,
}: LoadingScreenProps) {
  styles.useVariants({ tone });

  return (
    <View style={[styles.container, style]}>
      <Spinner size="large" tone={tone} />
      {label ? <Text style={styles.label}>{label}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.background,
  },
  label: {
    marginTop: theme.spacing.md,
    variants: {
      tone: {
        brand: { color: theme.colors.textTertiary },
        inverse: { color: theme.colors.textInverse },
      },
    },
  },
}));
