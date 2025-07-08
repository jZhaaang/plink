import { button } from '@/ui/variants/button';
import { Pressable, PressableProps, Text } from 'react-native';

type Props = PressableProps & {
  title: string;
  intent?: 'primary' | 'secondary' | 'warning';
  size?: 'sm' | 'md' | 'lg';
};

export default function Button({ title, intent, size, className, ...props }: Props) {
  return (
    <Pressable className={`${button({ intent, size })} ${className ?? ''}`} {...props}>
      <Text className="text-white text-base text-center font-medium">{title}</Text>
    </Pressable>
  );
}
