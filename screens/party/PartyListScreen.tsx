import { supabase } from '@/lib/supabase';
import { RootStackParamList } from '@/navigation/AppNavigator';
import { Database } from '@/types/supabase';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { Button, Pressable, Text, View } from 'react-native';

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

      const { data: parties } = await supabase
        .from('party_members')
        .select('party_id, parties (id, name)')
        .eq('user_id', user.id);

      const partyIds = parties?.map((party) => party.party_id) ?? [];

      const { data, error } = await supabase.from('parties').select('*').in('id', partyIds);

      if (!error && data) {
        setParties(data);
      } else {
        console.error('Error getting parties:', error.message);
      }
    };

    loadParties();
  }, []);

  return (
    <View className="bg-white p-4 rounded-xl">
      <Text className="text-xl font-bold text-blue-500">Your Parties</Text>
      {parties.map((party) => (
        <Pressable
          key={party.id}
          onPress={() =>
            navigation.navigate('PartyDetail', {
              partyId: party.id,
            })
          }
          className="bg-gray-100 p-3 rounded-lg mb-2"
        >
          <Text className="text-base">{party.name}</Text>
        </Pressable>
      ))}
      <Button title="Create Party" onPress={() => navigation.navigate('CreateParty')} />
    </View>
  );
}
