import React from 'react';
import { Pressable, View } from 'react-native';
import Animated, {
  SharedValue,
  useAnimatedStyle,
  interpolate,
} from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet } from 'react-native-unistyles';

export type FABAction = {
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  onPress: () => void;
};

interface Props {
  actions: FABAction[];
  isExpanded: SharedValue<number>;
  menuOpen: boolean;
}

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
      style={styles.container}
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
      style={[styles.fabItem, animatedStyle]}
    >
      <Pressable
        style={styles.fabItemPressable}
        onPress={action.onPress}
      >
        <MaterialCommunityIcons name={action.icon} size={22} color="#ffffff" />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    position: 'absolute',
    bottom: 0,
    alignItems: 'center',
    width: 64,
  },
  fabItem: {
    position: 'absolute',
    bottom: 0,
    borderRadius: theme.radii.full,
    backgroundColor: theme.colors.info,
    alignItems: 'center',
    justifyContent: 'center',
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    elevation: 6,
    ...theme.shadows.lg,
  },
  fabItemPressable: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
}));
