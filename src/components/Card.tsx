import { View, ViewProps } from 'react-native';
import { cn } from './cn';

type CardProps = ViewProps & { className?: string };
type CardSectionProps = ViewProps & { className?: string };

export default function Card({ className, ...rest }: CardProps) {
  return (
    <View
      {...rest}
      className={cn(
        'rounded-2xl border border-slate-200 bg-white p-4',
        className,
      )}
    />
  );
}

export function CardSection({ className, ...rest }: CardSectionProps) {
  return (
    <View
      {...rest}
      className={cn('border-t border-slate-100 mt-3 pt-3', className)}
    />
  );
}
