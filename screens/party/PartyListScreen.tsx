import { usePartyOverviews } from '@/lib/supabase/hooks/usePartyOverviews';
import { RootStackParamList } from '@/navigation/AppNavigator';
import { PartyOverviewCard } from '@/ui/components/PartyOverviewCard';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ActivityIndicator, FlatList, Pressable, Text, View } from 'react-native';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function PartyListScreen() {
  const navigation = useNavigation<Nav>();

  const { partyOverviews, loading, error } = usePartyOverviews();

  if (loading || !partyOverviews) return <ActivityIndicator />;

  return (
    <View className="flex-1 bg-white px-4 pt-4">
      <FlatList
        data={partyOverviews}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PartyOverviewCard
            partyOverview={item}
            onPress={() => navigation.navigate('PartyDetail', { partyId: item.id })}
          />
        )}
        ListFooterComponent={
          <Pressable
            onPress={() => navigation.navigate('CreateParty')}
            className="mt-4 p-4 rounded-xl items-center bg-purple-100"
          >
            <Text className="text-lg text-purple-800 font-semibold">+ Create a Party</Text>
          </Pressable>
        }
      />
    </View>
  );
}
