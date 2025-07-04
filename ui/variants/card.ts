import { tv } from 'tailwind-variants';

export const card = tv({
  base: 'rounded-xl p-4 bg-white dark:bg-neutral-200',
  variants: {
    elevated: {
      true: 'shadow-md shadow-black/100',
      false: 'shadow-none',
    },
  },
  defaultVariants: {
    elevated: false,
  },
});
