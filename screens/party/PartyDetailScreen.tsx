import {
  addPartyMember,
  getLinksByPartyId,
  getPartyById,
  getPartyMembers,
  getUserByEmail,
  getUserById,
  removePartyMember,
  supabase,
} from '@/lib/supabase/queries/';
import { RootStackParamList } from '@/navigation/AppNavigator';
import { Database } from '@/types/supabase';
import { Button, Container, Input, PressableCard } from '@/ui/components';
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
  const [currentUserId, setCurrentUserId] = useState<string>('');

  const [inviteEmail, setInviteEmail] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);

    const { data: party } = await getPartyById(partyId);
    const { data: members } = await getPartyMembers(partyId);
    const { data: links } = await getLinksByPartyId(partyId);
    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData.session?.user;

    if (party) setParty(party);
    if (members) setMembers(members);
    if (links) setLinks(links);
    if (user) setCurrentUserId(user.id);

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

  const removeMember = async (member: PartyMember) => {
    Alert.alert('Remove Member', `Are you sure you want to remove ${member.users.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          const { error } = await removePartyMember(partyId, member.user_id);

          if (error) {
            Alert.alert('Error', 'Could not remove user');
          } else {
            Alert.alert('Removed', `${member.users.name} has been removed`);
            fetchData();
          }
        },
      },
    ]);
  };

  if (loading) return <ActivityIndicator />;

  return (
    <Container>
      <Text className="text-xl font-bold mb-1">{party?.name ?? 'Unnamed Party'}</Text>
      <Text className="text-sm text-gray-500 mb-4">Party ID: {partyId}</Text>

      <Text className="text-base font-semibold mt-4">Members</Text>
      <View className="mb-2">
        {members.map((member) => (
          <View key={member.user_id} className="flex-row justify-between items-center mb-1">
            <Text>• {member.users.name}</Text>
            {member.user_id !== currentUserId && (
              <Button
                title="Remove"
                intent="warning"
                size="sm"
                onPress={() => removeMember(member)}
              />
            )}
          </View>
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
