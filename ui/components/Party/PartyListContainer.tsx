import { Party } from '@/types/models';
import { ScrollView, Text, View } from 'react-native';
import { CreatePartyCard } from './CreatePartyCard';
import { PartyCard } from './PartyCard';

type Props = {
  parties: Party[];
  onPressParty: (partyId: string) => void;
  onPressCreateParty: () => void;
  title?: string;
};

export function PartyListContainer({
  parties,
  onPressParty,
  onPressCreateParty,
  title = 'Your Parties',
}: Props) {
  return (
    <View className="p-4">
      <Text className="text-xl font-bold text-gray-900 mb-4">{title}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {parties.map((party) => (
          <PartyCard key={party.id} party={party} onPress={() => onPressParty(party.id)} />
        ))}
        <CreatePartyCard onPress={onPressCreateParty} />
      </ScrollView>
    </View>
  );
}
