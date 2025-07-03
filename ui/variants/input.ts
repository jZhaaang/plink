import { tv } from 'tailwind-variants';

export const input = tv({
  base: 'rounded-lg px-4 py-3 border bg-white text-black',
  variants: {
    error: {
      true: 'border-red-500',
      false: 'border-gray-300',
    },
  },
  defaultVariants: {
    error: false,
  },
});
