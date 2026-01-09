import { View, ViewProps } from 'react-native';
import { cn } from './cn';

type Props = ViewProps & { className?: string };

export default function Divider({ className, ...rest }: Props) {
  return <View {...rest} className={cn('h-[1px] bg-slate-200', className)} />;
}
