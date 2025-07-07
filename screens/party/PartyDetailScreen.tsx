import {
  addPartyMember,
  getLinksByPartyId,
  getPartyById,
  getPartyMembers,
  getUserByEmail,
  getUserById,
} from '@/lib/supabase';
import { RootStackParamList } from '@/navigation/AppNavigator';
import { Database } from '@/types/supabase';
import { Button, Container, Input, PressableCard } from '@/ui';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Text, View } from 'react-native';

type Route = RouteProp<RootStackParamList, 'PartyDetail'>;
type Nav = NativeStackNavigationProp<RootStackParamList>;
type Party = Database['public']['Tables']['parties']['Row'];
type PartyMember = Database['public']['Tables']['party_members']['Row'] & {
  users: { name: string | null };
};
type Link = Database['public']['Tables']['links']['Row'];

export default function PartyDetailScreen() {
  const { partyId } = useRoute<Route>().params;
  const navigation = useNavigation<Nav>();

  const [party, setParty] = useState<Party | null>(null);
  const [members, setMembers] = useState<PartyMember[]>([]);
  const [links, setLinks] = useState<Link[]>([]);

  const [inviteEmail, setInviteEmail] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);

    const { data: party } = await getPartyById(partyId);
    const { data: members } = await getPartyMembers(partyId);
    const { data: links } = await getLinksByPartyId(partyId);

    if (party) setParty(party);
    if (members) setMembers(members);
    if (links) setLinks(links);

    setLoading(false);
  }, [partyId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const inviteByEmail = async () => {
    const { data: inviteUser } = await getUserByEmail(inviteEmail);

    if (!inviteUser) {
      Alert.alert('User not found');
      return;
    }

    const { data: user } = await getUserById(inviteUser.id);

    if (!user) {
      Alert.alert('User not found');
      return;
    }

    const userId = user.id;

    const invitedUser = await addPartyMember({ user_id: userId, party_id: partyId });

    if (!invitedUser) {
      Alert.alert('Error inviting user.');
    } else {
      Alert.alert('User added!');
      fetchData();
    }
  };

  if (loading) return <ActivityIndicator />;

  return (
    <Container>
      <Text className="text-xl font-bold mb-1">{party?.name ?? 'Unnamed Party'}</Text>
      <Text className="text-sm text-gray-500 mb-4">Party ID: {partyId}</Text>

      <Text className="text-base font-semibold mt-4">Members</Text>
      <View className="mb-2">
        {members.map((member) => (
          <Text key={member.user_id}>• {member.users.name}</Text>
        ))}
      </View>

      <Input
        placeholder="Enter user email"
        value={inviteEmail}
        onChangeText={setInviteEmail}
        keyboardType="email-address"
        className="mb-4"
      />

      <Button
        title={loading ? 'Inviting...' : 'Invite a Friend'}
        onPress={inviteByEmail}
        disabled={loading}
      />

      {links.length > 0 ? (
        <>
          <Text className="text-base font-semibold mb-2">Active Links</Text>
          {links.map((link) => (
            <PressableCard
              key={link.id}
              onPress={() =>
                navigation.navigate('LinkDetail', { partyId: partyId, linkId: link.id })
              }
            >
              <Text className="text-base font-medium">{link.name}</Text>
            </PressableCard>
          ))}
        </>
      ) : (
        <Text className="text-gray-500">No Active Links</Text>
      )}

      <Button
        title="Start a Link"
        onPress={() => navigation.navigate('CreateLink', { partyId })}
        className="my-4"
      />
    </Container>
  );
}
