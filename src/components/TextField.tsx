import { Text, TextInput, TextInputProps, View } from 'react-native';
import { cn } from './cn';

type Props = TextInputProps & {
  header?: string;
  left?: React.ReactNode;
  right?: React.ReactNode;
  containerClassName?: string;
  inputClassName?: string;
};

export default function TextField({
  header,
  left,
  right,
  containerClassName,
  inputClassName,
  ...rest
}: Props) {
  return (
    <>
      {header && (
        <Text className="text-xs font-medium text-slate-600">{header}</Text>
      )}
      <View
        className={cn(
          'flex-row items-center rounded-2xl border border-slate-300 bg-white px-3',
          containerClassName,
        )}
      >
        {left}
        <TextInput
          {...rest}
          placeholderTextColor="#94a3b8"
          className={cn('ml-2 flex-1 py-3', inputClassName)}
          style={{ color: '#0f172a', fontSize: 14 }}
        />
        {right}
      </View>
    </>
  );
}
