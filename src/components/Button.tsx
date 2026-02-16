import { Pressable, Text, PressableProps } from 'react-native';
import { cn } from './cn';
import { Spinner } from './Loading';

type Variant = 'primary' | 'outline' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

type Props = PressableProps & {
  title: string;
  loading?: boolean;
  variant?: Variant;
  size?: Size;
  className?: string;
  textClassName?: string;
};

const base = 'rounded-2xl active:opacity-90 disabled:opacity-60';
const sizes: Record<Size, string> = {
  sm: 'py-2 px-3',
  md: 'py-3 px-4',
  lg: 'py-4 px-5',
};

const variants: Record<Variant, { root: string; text: string }> = {
  primary: { root: 'bg-blue-600', text: 'text-white' },
  outline: { root: 'border border-slate-300 bg-white', text: 'text-slate-900' },
  ghost: { root: 'bg-transparent', text: 'text-slate-900' },
};

export default function Button({
  title,
  loading,
  variant = 'primary',
  size = 'md',
  className,
  textClassName,
  ...rest
}: Props) {
  const v = variants[variant];
  return (
    <Pressable
      {...rest}
      className={cn(base, sizes[size], v.root, className)}
      accessibilityRole="button"
    >
      {loading ? (
        <Spinner tone={v.text.includes('white') ? 'inverse' : 'muted'} />
      ) : (
        <Text
          className={cn(
            'text-center text-base font-semibold',
            v.text,
            textClassName,
          )}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}
