import { input } from '@/ui/variants/input';
import { TextInput, TextInputProps } from 'react-native';

type Props = TextInputProps & {
  hasError?: boolean;
};

export default function Input({ hasError = false, className, ...props }: Props) {
  return <TextInput className={`${input({ error: hasError })} ${className ?? ''}`} {...props} />;
}
