import {
  ActivityIndicator,
  ActivityIndicatorProps,
  View,
  Text,
} from 'react-native';
import { cn } from './cn';

type Tone = 'brand' | 'inverse' | 'muted';

const COLORS: Record<Tone, string> = {
  brand: '#2563eb',
  inverse: '#ffffff',
  muted: '#64748b',
};

type SpinnerProps = {
  size?: ActivityIndicatorProps['size'];
  tone?: Tone;
};

export function Spinner({ size = 'small', tone = 'brand' }: SpinnerProps) {
  return <ActivityIndicator size={size} color={COLORS[tone]} />;
}

type LoadingScreenProps = {
  label?: string;
  tone?: Exclude<Tone, 'muted'>;
  className?: string;
};

export function LoadingScreen({
  label,
  tone = 'brand',
  className,
}: LoadingScreenProps) {
  const textClassName = tone === 'inverse' ? 'text-white/70' : 'text-slate-500';

  return (
    <View
      className={cn(
        'flex-1 items-center justify-center bg-neutral-50',
        className,
      )}
    >
      <Spinner size="large" tone={tone} />
      {label ? (
        <Text className={cn('mt-3', textClassName)}>{label}</Text>
      ) : null}
    </View>
  );
}
