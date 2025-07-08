import { tv } from 'tailwind-variants';

export const button = tv({
  base: 'rounded-xl py-3 mb-2 items-center justify-center',
  variants: {
    intent: {
      primary: 'bg-blue-600',
      secondary: 'bg-gray-400',
      warning: 'bg-red-500',
    },
    size: {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
    },
  },
  defaultVariants: {
    intent: 'primary',
    size: 'md',
  },
});
