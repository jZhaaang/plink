import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useActiveLinkContext } from '../providers/ActiveLinkProvider';
import { Pressable, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinkRow } from '../lib/models';
import { NavigationState, PartialState, Route } from '@react-navigation/native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useCallback, useEffect, useMemo, useState } from 'react';
import ExpandableFAB, { FABAction } from './ExpandableFAB';

type NestedRoute = Route<string> & {
  state?: NavigationState | PartialState<NavigationState>;
};

function getDeepFocusedRouteName(route: NestedRoute): string {
  let current: NestedRoute = route;
  while (current?.state && current.state.index != null) {
    current = current.state.routes[current.state.index] as NestedRoute;
  }
  return current?.name ?? route.name;
}

export default function CustomTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { activeLink, openCreateLink, requestUpload } = useActiveLinkContext();
  const isExpanded = useSharedValue(0);
  const [menuOpen, setMenuOpen] = useState(false);

  const activeTabRoute = state.routes[state.index] as NestedRoute;
  const currentScreen = getDeepFocusedRouteName(activeTabRoute);
  const isOnLinkDetail = currentScreen === 'LinkDetail';
  const showFAB = isOnLinkDetail && activeLink !== null;
  const centerIcon = showFAB ? 'plus' : 'party-popper';

  useEffect(() => {
    if (!isOnLinkDetail && menuOpen) {
      closeMenu();
    }
  }, [isOnLinkDetail]);

  const toggleMenu = useCallback(() => {
    const next = !menuOpen;
    setMenuOpen(next);
    isExpanded.value = withSpring(next ? 1 : 0, {
      damping: 80,
      stiffness: 500,
    });
  }, [menuOpen]);

  const closeMenu = () => {
    setMenuOpen(false);
    isExpanded.value = withSpring(0, { damping: 14, stiffness: 120 });
  };

  const handleCenterPress = (
    navigation: BottomTabBarProps['navigation'],
    activeLink: LinkRow | null,
  ) => {
    if (activeLink) {
      navigation.navigate('Link', {
        screen: 'LinkDetail',
        params: {
          linkId: activeLink.id,
          partyId: activeLink.party_id,
        },
      });
      return;
    }

    openCreateLink();
  };

  const centerRotationStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${interpolate(isExpanded.value, [0, 1], [0, 45])}deg` },
    ],
  }));

  const fabActions: FABAction[] = useMemo(
    () => [
      {
        icon: 'camera',
        onPress: () => {
          closeMenu();
          requestUpload('camera-photo');
        },
      },
      {
        icon: 'video',
        onPress: () => {
          closeMenu();
          requestUpload('camera-video');
        },
      },
      {
        icon: 'image-multiple',
        onPress: () => {
          closeMenu();
          requestUpload('gallery');
        },
      },
    ],
    [closeMenu, requestUpload],
  );

  const shouldHideTabBar =
    currentScreen === 'MediaViewer' || currentScreen === 'AllMedia';
  if (shouldHideTabBar) return null;

  return (
    <>
      {/* Backdrop to dismiss menu */}
      {menuOpen && (
        <Pressable
          className="absolute left-0 right-0 bottom-0"
          style={{ top: -2000 }}
          onPress={closeMenu}
        />
      )}
      <View
        className="flex-row bg-white border-t border-slate-200 items-end"
        style={{
          paddingBottom: 10 + insets.bottom,
          height: 50 + insets.bottom,
        }}
      >
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          if (route.name === 'Link') {
            return (
              <View key={route.key} className="flex-1 items-center">
                {/* Expandable action items */}
                {showFAB && (
                  <ExpandableFAB
                    actions={fabActions}
                    isExpanded={isExpanded}
                    menuOpen={menuOpen}
                  />
                )}

                {/* Main center button */}
                <TouchableOpacity
                  onPress={() => {
                    if (showFAB) {
                      toggleMenu();
                    } else {
                      handleCenterPress(navigation, activeLink);
                    }
                  }}
                  activeOpacity={0.8}
                  className="w-16 h-16 rounded-full bg-blue-500 items-center justify-center shadow-lg"
                  style={{ elevation: 8 }}
                >
                  {showFAB ? (
                    <View className="w-16 h-16">
                      <Animated.View
                        className="absolute inset-0 items-center justify-center"
                        style={centerRotationStyle}
                      >
                        <MaterialCommunityIcons
                          name="plus"
                          size={28}
                          color="#ffffff"
                        />
                      </Animated.View>
                    </View>
                  ) : (
                    <MaterialCommunityIcons
                      name={centerIcon}
                      size={28}
                      color="#ffffff"
                    />
                  )}
                </TouchableOpacity>
              </View>
            );
          }

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              className="flex-1 items-center justify-center"
            >
              {options.tabBarIcon?.({
                focused: isFocused,
                color: isFocused ? '#3b82f6' : '#94a3b8',
                size: 24,
              })}
            </TouchableOpacity>
          );
        })}
      </View>
    </>
  );
}
