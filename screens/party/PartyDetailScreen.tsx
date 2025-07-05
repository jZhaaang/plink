import { getLinksByPartyId, getPartyById } from '@/lib/supabase';
import { RootStackParamList } from '@/navigation/AppNavigator';
import { Database } from '@/types/supabase';
import { Button, Container, PressableCard } from '@/ui';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Text } from 'react-native';

type Route = RouteProp<RootStackParamList, 'PartyDetail'>;
type Nav = NativeStackNavigationProp<RootStackParamList>;
type Party = Database['public']['Tables']['parties']['Row'];
type Link = Database['public']['Tables']['links']['Row'];

export default function PartyDetailScreen() {
  const { partyId } = useRoute<Route>().params;
  const navigation = useNavigation<Nav>();

  const [party, setParty] = useState<Party | null>(null);
  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      const party = await getPartyById(partyId);
      const links = await getLinksByPartyId(partyId);

      setParty(party);
      setLinks(links);

      setLoading(false);
    };

    fetchData();
  }, [partyId]);

  if (loading) return <ActivityIndicator />;

  return (
    <Container>
      <Text className="text-xl font-bold mb-1">{party?.name ?? 'Unnamed Party'}</Text>
      <Text className="text-sm text-gray-500 mb-4">Party ID: {partyId}</Text>

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
