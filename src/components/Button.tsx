import { Pressable, Text, View, type PressableProps } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import { Spinner } from './Loading';
import { useState } from 'react';

type Variant = 'primary' | 'outline' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends PressableProps {
  title: string;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

export default function Button({
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  style,
  onPressIn,
  onPressOut,
  ...rest
}: ButtonProps) {
  const [pressed, setPressed] = useState(false);
  const isDisabled = disabled || loading;
  const isOutlinePressed = pressed && variant === 'outline';

  styles.useVariants({ variant, size, isDisabled, pressed, isOutlinePressed });

  return (
    <Pressable
      disabled={isDisabled}
      onPressIn={(e) => {
        setPressed(true);
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        setPressed(false);
        onPressOut?.(e);
      }}
      style={style}
      {...rest}
    >
      <View style={styles.container}>
        {loading ? (
          <Spinner tone={variant === 'primary' ? 'inverse' : 'muted'} />
        ) : (
          <Text style={styles.label}>{title}</Text>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radii.lg,
    variants: {
      variant: {
        primary: { backgroundColor: theme.colors.primary },
        outline: {
          backgroundColor: theme.colors.surface,
          borderWidth: 1,
          borderColor: theme.colors.borderInput,
        },
        ghost: { backgroundColor: 'transparent' },
      },
      size: {
        sm: {
          paddingVertical: theme.spacing.sm,
          paddingHorizontal: theme.spacing.md,
        },
        md: {
          paddingVertical: theme.spacing.md,
          paddingHorizontal: theme.spacing.lg,
        },
        lg: {
          paddingVertical: theme.spacing.lg,
          paddingHorizontal: theme.spacing.xl,
        },
      },
      pressed: {
        true: { opacity: 0.85 },
        false: {},
      },
      isDisabled: {
        true: { opacity: 0.6 },
        false: {},
      },
      isOutlinePressed: {
        true: { backgroundColor: theme.colors.surfacePressed },
        false: {},
      },
    },
  },

  label: {
    fontWeight: theme.fontWeights.semibold,
    textAlign: 'center',
    variants: {
      variant: {
        primary: { color: theme.colors.primaryText },
        outline: { color: theme.colors.textPrimary },
        ghost: { color: theme.colors.textPrimary },
      },
      size: {
        sm: { fontSize: theme.fontSizes.xs },
        md: { fontSize: theme.fontSizes.sm },
        lg: { fontSize: theme.fontSizes.base },
      },
    },
  },
}));
