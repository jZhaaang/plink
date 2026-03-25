import Animated, { FadeInDown } from 'react-native-reanimated';

interface Props {
  index: number;
  children: React.ReactNode;
}

export default function AnimatedListItem({ index, children }: Props) {
  return (
    <Animated.View
      entering={FadeInDown.delay(Math.min(index, 5) * 80).springify()}
    >
      {children}
    </Animated.View>
  );
}
