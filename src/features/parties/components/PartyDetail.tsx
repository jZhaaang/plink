import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Image, Pressable, View, Text } from 'react-native';

type Props = {
  name?: string;
  avatarUri?: string;
  bannerUri?: string;
  onPressAvatar?: () => void;
  onPressBanner?: () => void;
  mode: 'preview' | 'regular';
};

export default function PartyDetail({
  name,
  avatarUri,
  bannerUri,
  onPressAvatar,
  onPressBanner,
  mode,
}: Props) {
  return (
    <View className="mt-3 w-full">
      <Pressable
        onPress={onPressBanner}
        className="w-fill aspect-[3/1] rounded-xl overflow-hidden bg-sky-100"
      >
        {bannerUri ? (
          <Image
            source={{ uri: bannerUri }}
            resizeMode="stretch"
            className="flex-1"
          />
        ) : (
          <LinearGradient
            colors={['#b5d6fcff', '#2a88fcff']}
            start={{ x: 0.5, y: 1 }}
            end={{ x: 0.5, y: 0 }}
            className="flex-1 items-center justify-center"
          >
            {mode === 'preview' && (
              <MaterialIcons
                name="photo-size-select-large"
                size={48}
                color="#5e5e5eff"
              />
            )}
          </LinearGradient>
        )}
      </Pressable>

      <View className="flex-row -mt-12 px-4 gap-2">
        <Pressable onPress={onPressAvatar}>
          <View className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg">
            {avatarUri ? (
              <Image
                source={{ uri: avatarUri }}
                resizeMode="stretch"
                className="flex-1"
              />
            ) : (
              <LinearGradient
                colors={['#93c5fd', '#bef7d7ff']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="flex-1 items-center justify-center"
              >
                {mode === 'preview' && (
                  <MaterialIcons
                    name="add-a-photo"
                    size={32}
                    color="#5e5e5eff"
                  />
                )}
              </LinearGradient>
            )}
          </View>
        </Pressable>

        <View className="rounded-xl bg-white flex-1 mt-4 mb-2">
          <Text className="pl-4 pt-2 font-semibold text-lg">{name}</Text>
        </View>
      </View>
    </View>
  );
}
