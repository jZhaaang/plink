import {
  ActivityIndicator,
  ActivityIndicatorProps,
  View,
  Text,
  ViewStyle,
} from 'react-native';
import { StyleSheet, UnistylesRuntime } from 'react-native-unistyles';

type Tone = 'brand' | 'inverse' | 'muted';

interface SpinnerProps {
  size?: ActivityIndicatorProps['size'];
  tone?: Tone;
}

export function Spinner({ size = 'small', tone = 'brand' }: SpinnerProps) {
  const theme = UnistylesRuntime.getTheme();
  const colors: Record<Tone, string> = {
    brand: theme.colors.spinnerBrand,
    inverse: theme.colors.spinnerInverse,
    muted: theme.colors.spinnerMuted,
  };
  return <ActivityIndicator size={size} color={colors[tone]} />;
}

interface LoadingScreenProps {
  label?: string;
  tone?: Exclude<Tone, 'muted'>;
  style?: ViewStyle;
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
        inverse: { color: 'rgba(255,255,255,0,7)' },
      },
    },
  },
}));
