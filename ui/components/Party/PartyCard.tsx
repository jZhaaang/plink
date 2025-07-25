import { Party } from '@/types/models';
import { Pressable, Text, View } from 'react-native';
import { Avatar } from '../Avatar';
import { PartyBanner } from './PartyBanner';

type Props = {
  party: Party;
  onPress: () => void;
};

export function PartyCard({ party, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      className="w-60 rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden mr-4"
    >
      <PartyBanner uri={party.banner_url} />

      <View className="relative px-4 pt-6 pb-4">
        <Avatar
          uri={party.avatar_url}
          size={60}
          style={{
            position: 'absolute',
            top: -28,
            left: 16,
          }}
        />

        <View className="ml-20 justify-center">
          <Text className="font-semibold text-gray-900 text-base -mt-4">{party.name}</Text>
        </View>
      </View>
    </Pressable>
  );
}
