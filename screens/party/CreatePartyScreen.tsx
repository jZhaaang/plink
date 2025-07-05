import { addPartyMember, createParty as createPartyHelper, supabase } from '@/lib/supabase';
import { RootStackParamList } from '@/navigation/AppNavigator';
import { Button, Container, Input } from '@/ui';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Text } from 'react-native';

type Nav = NativeStackNavigationProp<RootStackParamList, 'PartyDetail'>;

export default function CreatePartyScreen() {
  const navigation = useNavigation<Nav>();

  const [partyName, setPartyName] = useState('');
  const [loading, setLoading] = useState(false);

  const createParty = async () => {
    setLoading(true);

    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData.session?.user;
    if (!user || !partyName) return;

    const party = await createPartyHelper({ name: partyName, created_by: user.id });
    if (party) {
      await addPartyMember({ party_id: party?.id, user_id: user.id });

      navigation.navigate('PartyDetail', {
        partyId: party.id,
      });
    }

    setLoading(false);
  };

  return (
    <Container className="flex-1 justify-center px-6">
      <Text className="text-lg font-semibold mb-4 text-center text-gray-800">
        Create a New Party
      </Text>

      <Input
        placeholder="Enter party name"
        value={partyName}
        onChangeText={setPartyName}
        className="mb-4"
      />

      <Button
        title={loading ? 'Creating...' : 'Create Party'}
        onPress={createParty}
        disabled={loading}
      />
    </Container>
  );
}
