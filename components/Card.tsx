import { card } from '@/ui/variants/card';
import { View, ViewProps } from 'react-native';

type Props = ViewProps & {
  elevated?: boolean;
};

export default function Card({ elevated = true, className, children, ...props }: Props) {
  return (
    <View className={`${card({ elevated })} ${className ?? ''})`} {...props}>
      {children}
    </View>
  );
}
