import { tv } from 'tailwind-variants';

export const card = tv({
  base: 'rounded-xl p-4 bg-white shadow-sm dark:bg-neutral-900',
  variants: {
    elevated: {
      true: 'shadow-md',
      false: 'shadow-none',
    },
  },
  defaultVariants: {
    elevated: true,
  },
});
