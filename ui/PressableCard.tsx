import { card } from '@/ui/variants/card';
import { ReactNode } from 'react';
import type { PressableStateCallbackType } from 'react-native';
import { Pressable, PressableProps } from 'react-native';

type Props = PressableProps & {
  elevated?: boolean;
  className?: string;
  children: ReactNode | ((state: PressableStateCallbackType) => ReactNode);
};

export default function PressableCard({ elevated, className, children, ...props }: Props) {
  return (
    <Pressable {...props} className={`${card({ elevated })} ${className ?? ''}`}>
      {children}
    </Pressable>
  );
}
