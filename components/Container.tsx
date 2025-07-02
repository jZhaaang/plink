import { container } from '@/ui/variants/container';
import { View, ViewProps } from 'react-native';

export default function Container({ children, className, ...props }: ViewProps) {
  return (
    <View className={`${container()} ${className ?? ''})`} {...props}>
      {children}
    </View>
  );
}
