import { ImageBackground, Pressable, View, Text, Image } from 'react-native';
import { PartyWithMembersResolved } from '../../../lib/models';

type Props = {
  party: PartyWithMembersResolved;
  onPress?: (id: string) => void;
};

export function PartyCard({ party, onPress }: Props) {
  return (
    <Pressable onPress={() => onPress?.(party.id)} className="mb-4">
      <View className="rounded-2xl overflow-hidden bg-white shadow-lg">
        <ImageBackground
          source={{ uri: party.bannerUrl }}
          resizeMode="cover"
          className="h-28 w-full"
        >
          <View className="h-full w-full bg-black/25" />
        </ImageBackground>
        <View className="px-4 pb-4">
          <View className="-mt-6 mb-2 flex-row items-end">
            <View className="w-20 h-20 rounded-full border-2 border-white overflow-hidden mr-3">
              <Image
                source={{ uri: party.avatarUrl }}
                resizeMode="cover"
                className="flex-1"
              />
            </View>
            <Text className="text-base font-semibold text-neutral-900 flex-1">
              {party.name}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}
