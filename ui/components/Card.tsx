import { card } from '@/ui/variants/card';
import { ReactNode } from 'react';
import { View, ViewProps } from 'react-native';

type Props = ViewProps & {
  elevated?: boolean;
  className?: string;
  children: ReactNode;
};

export default function Card({ elevated, className, children, ...props }: Props) {
  return (
    <View className={`${card({ elevated })} ${className ?? ''}`} {...props}>
      {children}
    </View>
  );
}
