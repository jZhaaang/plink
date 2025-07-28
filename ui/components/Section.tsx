import { ReactNode } from 'react';
import { Text, View } from 'react-native';

type Props = {
  title: string;
  children?: ReactNode;
  className?: string;
};

export function Section({ title, children, className = '' }: Props) {
  return (
    <View className={`mb-4 ${className}`}>
      <Text className="text-lg font-semibold text-gray-900">{title}</Text>
      {children}
    </View>
  );
}
