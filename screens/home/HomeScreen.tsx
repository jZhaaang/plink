import { useLinkOverviews } from '@/lib/supabase/hooks/useLinkOverviews';
import useParties from '@/lib/supabase/hooks/useParties';
import { RootStackParamList } from '@/navigation/AppNavigator';
import { LinkListContainer } from '@/ui/components/Link/LinkListContainer';
import { PartyListContainer } from '@/ui/components/Party/PartyListContainer';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ActivityIndicator, ScrollView } from 'react-native';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function HomeScreen() {
  const navigation = useNavigation<Nav>();

  const { linkOverviews, loading: linksLoading } = useLinkOverviews();
  const { parties, loading: partiesLoading } = useParties();

  if (linksLoading || partiesLoading || !linkOverviews || !parties) return <ActivityIndicator />;

  return (
    <ScrollView className="flex-1 bg-white">
      <PartyListContainer
        parties={parties}
        onPressParty={(partyId) => navigation.navigate('PartyDetail', { partyId })}
        onPressCreateParty={() => navigation.navigate('CreateParty')}
      />
      <LinkListContainer
        linkOverviews={linkOverviews}
        onPressLink={(partyId, linkId) => navigation.navigate('LinkDetail', { partyId, linkId })}
        showPartyInfo={true}
      />
    </ScrollView>
  );
}
