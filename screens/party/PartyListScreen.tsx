import { getUserParties, supabase } from '@/lib/supabase';
import { RootStackParamList } from '@/navigation/AppNavigator';
import { Database } from '@/types/supabase';
import { Button, Container, PressableCard } from '@/ui/components';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { Text } from 'react-native';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Party = Database['public']['Tables']['parties']['Row'];

export default function PartyListScreen() {
  const navigation = useNavigation<Nav>();
  const [parties, setParties] = useState<Party[]>([]);

  useEffect(() => {
    const loadParties = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData.session?.user;
      if (!user) return;

      const { data: parties } = await getUserParties(user.id);

      if (parties) setParties(parties);
    };

    loadParties();
  }, []);

  return (
    <Container>
      <Text className="text-xl font-bold text-blue-500 my-4">Your Parties</Text>

      {parties.map((party) => (
        <PressableCard
          key={party.id}
          elevated
          onPress={() => navigation.navigate('PartyDetail', { partyId: party.id })}
          className="mb-2"
        >
          <Text className="text-base font-medium">{party.name}</Text>
        </PressableCard>
      ))}
      <Button
        title="Create Party"
        onPress={() => navigation.navigate('CreateParty')}
        className="mt-8"
      />
    </Container>
  );
}
