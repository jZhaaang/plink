import React from 'react';
import { Pressable, View } from 'react-native';
import Animated, {
  SharedValue,
  useAnimatedStyle,
  interpolate,
} from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export type FABAction = {
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  onPress: () => void;
};

type Props = {
  actions: FABAction[];
  isExpanded: SharedValue<number>;
  menuOpen: boolean;
};

const ITEM_SIZE = 48;
const ITEM_GAP = 12;
const VERTICAL_OFFSET = -72;

export default function ExpandableFAB({
  actions,
  isExpanded,
  menuOpen,
}: Props) {
  const totalWidth =
    actions.length * ITEM_SIZE + (actions.length - 1) * ITEM_GAP;
  const startX = -(totalWidth / 2) + ITEM_SIZE / 2;

  return (
    <View
      pointerEvents="box-none"
      className="absolute bottom-0 items-center w-16"
    >
      {actions.map((action, index) => {
        const targetX = startX + index * (ITEM_SIZE + ITEM_GAP);
        return (
          <FABItem
            key={index}
            action={action}
            targetX={targetX}
            isExpanded={isExpanded}
            menuOpen={menuOpen}
          />
        );
      })}
    </View>
  );
}

function FABItem({
  action,
  targetX,
  isExpanded,
  menuOpen,
}: {
  action: FABAction;
  targetX: number;
  isExpanded: SharedValue<number>;
  menuOpen: boolean;
}) {
  const animatedStyle = useAnimatedStyle(() => {
    const translateX = interpolate(isExpanded.value, [0, 1], [0, targetX]);
    const translateY = interpolate(
      isExpanded.value,
      [0, 1],
      [0, VERTICAL_OFFSET],
    );
    const scale = interpolate(isExpanded.value, [0, 1], [0.3, 1]);
    const opacity = interpolate(isExpanded.value, [0, 1], [0, 1]);

    return {
      transform: [{ translateX }, { translateY }, { scale }] as const,
      opacity,
    };
  });

  return (
    <Animated.View
      pointerEvents={menuOpen ? 'auto' : 'none'}
      className="absolute bottom-0 rounded-full bg-blue-500 items-center justify-center shadow-lg"
      style={[
        { width: ITEM_SIZE, height: ITEM_SIZE, elevation: 6 },
        animatedStyle,
      ]}
    >
      <Pressable
        className="w-full h-full items-center justify-center"
        onPress={action.onPress}
      >
        <MaterialCommunityIcons name={action.icon} size={22} color="#ffffff" />
      </Pressable>
    </Animated.View>
  );
}
