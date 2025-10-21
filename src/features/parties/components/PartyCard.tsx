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
            <View
              className="rounded-full border-2 border-white overflow-hidden mr-3"
              style={{ width: 56, height: 56 }}
            >
              <Image
                source={{ uri: party.avatarUrl }}
                style={{ width: 56, height: 56 }}
                resizeMode="cover"
              />
            </View>
            <Text
              className="text-base font-semibold text-neutral-900 flex-1"
              numberOfLines={1}
            >
              {party.name}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}
