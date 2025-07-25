import { usePartyDetail } from '@/lib/supabase/hooks/usePartyDetail';
import { RootStackParamList } from '@/navigation/AppNavigator';
import { CreateLinkCard, LinkCard, LinkListContainer } from '@/ui/components/Link';
import { PartyHeader } from '@/ui/components/Party';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';

type Route = RouteProp<RootStackParamList, 'PartyDetail'>;
type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function PartyDetailScreen() {
  const navigation = useNavigation<Nav>();
  const { partyId } = useRoute<Route>().params;

  const { partyDetail, loading } = usePartyDetail(partyId);

  if (loading || !partyDetail) return <ActivityIndicator />;

  const linkOverviews = partyDetail.linkOverviews ?? [];
  const activeLink = linkOverviews.find((linkOverview) => linkOverview.link.is_active) || null;
  const previousLinks = linkOverviews.filter((linkOverview) => !linkOverview.link.is_active);

  return (
    <ScrollView className="flex-1 bg-white">
      <PartyHeader partyOverview={partyDetail.partyOverview} />
      {activeLink ? (
        <View className="p-4">
          <Text className="font-semibold text-lg py-2">Active Link</Text>
          <LinkCard
            linkOverview={activeLink}
            onPress={(partyId, linkId) => navigation.navigate('LinkDetail', { partyId, linkId })}
          />
        </View>
      ) : (
        <View className="p-4">
          <Text className="font-semibold text-lg py-2">No Active Link</Text>
          <CreateLinkCard onPress={() => {}} />
        </View>
      )}
      <LinkListContainer
        linkOverviews={previousLinks}
        onPressLink={(partyId, linkId) => navigation.navigate('LinkDetail', { partyId, linkId })}
        showPartyInfo={false}
      />
    </ScrollView>
  );
}
