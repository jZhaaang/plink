import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useActiveLinkContext } from '../providers/ActiveLinkProvider';
import { Pressable, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinkRow } from '../lib/models';
import { NavigationState, PartialState, Route } from '@react-navigation/native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useCallback, useEffect, useMemo, useState } from 'react';
import ExpandableFAB, { FABAction } from './ExpandableFAB';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

type NestedRoute = Route<string> & {
  state?: NavigationState | PartialState<NavigationState>;
};

function getDeepFocusedNameAndParams(route: NestedRoute): {
  name: string;
  params: Record<string, unknown> | undefined;
} {
  let current: NestedRoute = route;
  while (current?.state && current.state.index != null) {
    current = current.state.routes[current.state.index] as NestedRoute;
  }
  return {
    name: current?.name ?? route.name,
    params: current?.params as Record<string, unknown> | undefined,
  };
}

function getInitialRouteName(tabName: string): string {
  switch (tabName) {
    case 'Home':
      return 'HomeFeed';
    case 'Party':
      return 'PartyList';
    default:
      return tabName;
  }
}

export default function CustomTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { theme } = useUnistyles();

  const { activeLink, openCreateLink, requestUpload } = useActiveLinkContext();
  const isExpanded = useSharedValue(0);
  const tabBarTranslateY = useSharedValue(0);
  const [menuOpen, setMenuOpen] = useState(false);

  const activeTabRoute = state.routes[state.index] as NestedRoute;
  const { name: currentScreen, params: currentParams } =
    getDeepFocusedNameAndParams(activeTabRoute);
  const isOnLinkDetail = currentScreen === 'LinkDetail';
  const isViewingActiveLink =
    isOnLinkDetail &&
    activeLink !== null &&
    currentParams?.linkId === activeLink.id;
  const centerIcon = isViewingActiveLink ? 'plus' : 'party-popper';
  const shouldHideTabBar =
    currentScreen === 'MediaViewer' || currentScreen === 'AllMedia';

  useEffect(() => {
    if (!isOnLinkDetail && menuOpen) {
      closeMenu();
    }
  }, [isOnLinkDetail]);

  useEffect(() => {
    tabBarTranslateY.value = withTiming(shouldHideTabBar ? 1 : 0, {
      duration: 300,
      easing: Easing.out(Easing.cubic),
    });
  }, [shouldHideTabBar]);

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

  const tabBarAnimatedStyle = useAnimatedStyle(() => {
    const height = 55 + insets.bottom + 30;
    return {
      transform: [
        {
          translateY: interpolate(tabBarTranslateY.value, [0, 1], [0, height]),
        },
      ],
    };
  });

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

  return (
    <>
      {/* Backdrop to dismiss menu */}
      {menuOpen && (
        <Pressable
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            top: -2000,
          }}
          onPress={closeMenu}
        />
      )}
      <Animated.View
        style={[
          styles.tabBar,
          {
            paddingBottom: 10 + insets.bottom,
            height: 55 + insets.bottom,
          },
          tabBarAnimatedStyle,
        ]}
        pointerEvents={shouldHideTabBar ? 'none' : 'auto'}
      >
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          if (route.name === 'Link') {
            return (
              <View key={route.key} style={styles.centerTab}>
                {/* Expandable action items */}
                {isViewingActiveLink && (
                  <ExpandableFAB
                    actions={fabActions}
                    isExpanded={isExpanded}
                    menuOpen={menuOpen}
                  />
                )}

                {/* Main center button */}
                <Pressable
                  onPress={() => {
                    if (isViewingActiveLink) {
                      toggleMenu();
                    } else {
                      handleCenterPress(navigation, activeLink);
                    }
                  }}
                >
                  <View style={styles.centerButton}>
                    {isViewingActiveLink ? (
                      <View style={styles.centerButtonInner}>
                        <Animated.View
                          style={[styles.centerIconWrap, centerRotationStyle]}
                        >
                          <MaterialCommunityIcons
                            name="plus"
                            size={theme.iconSizes.xl}
                            color={theme.colors.white}
                          />
                        </Animated.View>
                      </View>
                    ) : (
                      <MaterialCommunityIcons
                        name={centerIcon}
                        size={theme.iconSizes.xl}
                        color={theme.colors.white}
                      />
                    )}
                  </View>
                </Pressable>
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
            } else {
              navigation.navigate(route.name, {
                screen: getInitialRouteName(route.name),
              });
            }
          };

          return (
            <Pressable key={route.key} onPress={onPress} style={{ flex: 1 }}>
              <View style={styles.tab}>
                {options.tabBarIcon?.({
                  focused: isFocused,
                  color: isFocused
                    ? theme.colors.primary
                    : theme.colors.lightGray,
                  size: 24,
                })}
              </View>
            </Pressable>
          );
        })}
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create((theme) => ({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    alignItems: 'flex-end',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  centerTab: {
    flex: 1,
    alignItems: 'center',
  },
  centerButton: {
    width: 64,
    height: 64,
    borderRadius: theme.radii.full,
    backgroundColor: theme.colors.info,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerButtonInner: {
    width: 64,
    height: 64,
  },
  centerIconWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
}));
