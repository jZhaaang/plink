import { PartyOverview } from '@/types/models';
import { Image, Pressable, Text, View } from 'react-native';

type Props = {
  partyOverview: PartyOverview;
  onPress: () => void;
};

export function PartyOverviewCard({ partyOverview, onPress }: Props) {
  const { party, partyMembers } = partyOverview;
  const memberAvatars = partyMembers.map((member) => member.avatar_url);

  return (
    <Pressable
      onPress={onPress}
      className="mr-3 w-48 rounded-xl overflow-hidden border border-gray-200 bg-white shadow-sm"
    >
      {party.banner_url && (
        <Image source={{ uri: party.banner_url }} className="w-full h-24" resizeMode="cover" />
      )}
      <View className="p-3">
        <View className="flex-row items-center mb-2">
          <Image source={{ uri: party.avatar_url }} className="w-8 h-8 rounded-full mr-2" />
          <Text className="font-semibold text-gray-900">{party.name}</Text>
        </View>
        <View className="flex-row">
          {memberAvatars.map((url, i) => (
            <Image
              key={i}
              source={{ uri: url }}
              className={`w-6 h-6 rounded-full border-2 border-white ${i > 0 ? '-ml-2' : ''}`}
            />
          ))}
        </View>
      </View>
    </Pressable>
  );
}
