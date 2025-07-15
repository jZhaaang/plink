import { useLinkOverviews } from '@/lib/supabase/hooks/useLinkOverviews';
import { usePartyOverviews } from '@/lib/supabase/hooks/usePartyOverviews';
import { RootStackParamList } from '@/navigation/AppNavigator';
import { LinkOverviewCard } from '@/ui/components/LinkOverviewCard';
import { PartyOverviewCard } from '@/ui/components/PartyOverviewCard';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function HomeScreen() {
  const navigation = useNavigation<Nav>();

  const { linkOverviews, loading: linksLoading } = useLinkOverviews();
  const { partyOverviews, loading: partiesLoading } = usePartyOverviews();

  if (linksLoading || partiesLoading || !linkOverviews || !partyOverviews)
    return <ActivityIndicator />;

  return (
    <ScrollView className="flex-1 bg-gray-50 px-4 pt-4">
      <Text className="text-xl font-bold text-gray-900 mb-2">Your Parties</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
        {partyOverviews.map((item) => (
          <PartyOverviewCard
            key={item.party.id}
            partyOverview={item}
            onPress={() => navigation.navigate('PartyDetail', { partyId: item.party.id })}
          />
        ))}
      </ScrollView>

      <Text className="text-xl font-bold mb-2">Recent Links</Text>
      <View>
        {linkOverviews.map((item) => (
          <LinkOverviewCard
            key={item.link.id}
            linkOverview={item}
            onPress={() =>
              navigation.navigate('LinkDetail', { partyId: item.party.id, linkId: item.link.id })
            }
          />
        ))}
      </View>
    </ScrollView>
  );
}
