import { TextInput, TextInputProps, View } from 'react-native';
import { cn } from './cn';

type Props = TextInputProps & {
  left?: React.ReactNode;
  right?: React.ReactNode;
  containerClassName?: string;
  inputClassName?: string;
};

export default function TextField({
  left,
  right,
  containerClassName,
  inputClassName,
  ...rest
}: Props) {
  return (
    <View
      className={cn(
        'flex-row items-center rounded-2xl border border-slate-300 bg-white px-3',
        containerClassName,
      )}
    >
      {left}
      <TextInput
        {...rest}
        className={cn('ml-2 flex-1 py-3 text-base', inputClassName)}
      />
      {right}
    </View>
  );
}
