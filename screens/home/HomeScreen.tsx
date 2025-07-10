import { useLinkOverviews } from '@/lib/supabase/hooks/useLinkOverviews';
import { RootStackParamList } from '@/navigation/AppNavigator';
import { LinkOverviewCard } from '@/ui/components/LinkOverviewCard';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ActivityIndicator, FlatList, View } from 'react-native';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function HomeScreen() {
  const navigation = useNavigation<Nav>();

  const { linkOverviews, loading, error } = useLinkOverviews();

  if (loading || !linkOverviews) return <ActivityIndicator />;

  return (
    <View className="flex-1 bg-white px-4 pt-4">
      <FlatList
        data={linkOverviews}
        keyExtractor={(item) => item.party.id}
        renderItem={({ item }) => (
          <LinkOverviewCard
            linkOverview={item}
            onPress={() =>
              navigation.navigate('LinkDetail', { partyId: item.party.id, linkId: item.link.id })
            }
          />
        )}
      />
    </View>
  );
}
