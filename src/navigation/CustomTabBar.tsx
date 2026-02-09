import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useActiveLinkContext } from "../providers/ActiveLinkProvider";
import { TouchableOpacity, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinkRow } from "../lib/models";

export default function CustomTabBar({
  state, descriptors, navigation,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { activeLink, openCreateLink, triggerUpload } = useActiveLinkContext();

  const partyRoute = state.routes[state.index];
  const nestedState = partyRoute?.state;
  const currentScreen = nestedState?.routes?.[nestedState.index ?? 0]?.name;
  const isOnLinkDetail = currentScreen === 'LinkDetail';

  const centerIcon = isOnLinkDetail && activeLink !== null ? 'camera-party-mode' : 'party-popper';

  function handleCenterPress(
    navigation: BottomTabBarProps['navigation'],
    activeLink: LinkRow | null,
    isOnLinkDetail: boolean,
  ) {
    if (activeLink && isOnLinkDetail && activeLink) {
      triggerUpload();
      return;
    }

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
  }

  return (
    <View
      className="flex-row bg-white border-t border-slate-200 items-end"
      style={{ paddingBottom: insets.bottom, height: 40 + insets.bottom }}
    >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        if (route.name === 'Link') {
          return (
            <View
              key={route.key}
              className="flex-1 items-center"
            >
              <TouchableOpacity
                onPress={() => handleCenterPress(navigation, activeLink, isOnLinkDetail)}
                activeOpacity={0.8}
                className="w-16 h-16 rounded-full bg-blue-500 items-center justify-center shadow-lg"
                style={{ elevation: 8 }}
              >
                <MaterialCommunityIcons name={centerIcon} size={28} color="#ffffff" />
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
  );
}