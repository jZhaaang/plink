import { View, Text, ViewProps } from 'react-native';
import { cn } from './cn';

type Props = ViewProps & {
  title: string;
  count?: number;
  action?: React.ReactNode;
  className?: string;
};

export default function SectionHeader({
  title,
  count,
  action,
  className,
  ...rest
}: Props) {
  return (
    <View
      {...rest}
      className={cn('flex-row items-center justify-between mb-3', className)}
    >
      <View className="flex-row items-center">
        <Text
          className="text-lg font-semibold text-slate-900 mr-2"
          numberOfLines={1}
        >
          {title}
        </Text>
        {count !== undefined && (
          <View className="bg-slate-100 rounded-full px-2 py-0.5">
            <Text className="text-sm text-slate-600">{count}</Text>
          </View>
        )}
      </View>
      {action}
    </View>
  );
}
