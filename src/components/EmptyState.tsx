import { View, Text, ViewProps } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { cn } from './cn';

type Props = ViewProps & {
  icon?: keyof typeof Feather.glyphMap;
  title: string;
  message?: string;
  action?: React.ReactNode;
  className?: string;
};

export default function EmptyState({
  icon,
  title,
  message,
  action,
  className,
  ...rest
}: Props) {
  return (
    <View {...rest} className={cn('items-center py-8 px-4', className)}>
      {icon && (
        <View className="bg-slate-100 rounded-full p-3 mb-3">
          <Feather name={icon} size={24} color="#64748b" />
        </View>
      )}
      <Text className="text-base font-medium text-slate-700 text-center">
        {title}
      </Text>
      {message && (
        <Text className="text-sm text-slate-500 text-center mt-1">
          {message}
        </Text>
      )}
      {action && <View className="mt-4">{action}</View>}
    </View>
  );
}
