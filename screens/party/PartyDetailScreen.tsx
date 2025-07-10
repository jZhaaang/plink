import { usePartyDetail } from '@/lib/supabase/hooks/usePartyDetail';
import { RootStackParamList } from '@/navigation/AppNavigator';
import { LinkCard } from '@/ui/components/LinkCard';
import { PartyHeader } from '@/ui/components/PartyHeader';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ActivityIndicator, FlatList } from 'react-native';

type Route = RouteProp<RootStackParamList, 'PartyDetail'>;
type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function PartyDetailScreen() {
  const navigation = useNavigation<Nav>();
  const { partyId } = useRoute<Route>().params;

  const { partyDetail, loading, error } = usePartyDetail(partyId);

  if (loading || !partyDetail) return <ActivityIndicator />;

  return (
    <FlatList
      className="bg-white"
      ListHeaderComponent={<PartyHeader partyDetail={partyDetail.party} />}
      data={partyDetail.links}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <LinkCard
          link={item}
          onPress={() => {
            navigation.navigate('LinkDetail', { partyId, linkId: item.id });
          }}
        />
      )}
    />
  );
}
