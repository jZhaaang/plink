import { usePartiesWithRecentLink } from '@/lib/supabase/hooks/usePartiesWithRecentLink';
import { RootStackParamList } from '@/navigation/AppNavigator';
import { PartyCard } from '@/ui/components/PartyCard';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ActivityIndicator, FlatList, Pressable, Text, View } from 'react-native';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function PartyListScreen() {
  const navigation = useNavigation<Nav>();

  const { parties, loading, error } = usePartiesWithRecentLink();

  if (loading || !parties) return <ActivityIndicator />;

  return (
    <View className="flex-1 bg-white px-4 pt-4">
      <FlatList
        data={parties}
        keyExtractor={(item) => item.party.id}
        renderItem={({ item }) => (
          <PartyCard
            partyName={item.party.name}
            avatarUrl={item.party.avatar_url}
            bannerUrl={item.party.banner_url ?? ''}
            memberAvatars={item.memberAvatars}
            recentLinkName={item.link?.name ?? ''}
            recentLinkCreatedAt={item.link?.created_at ?? ''}
            isActive={item.link?.is_active ?? false}
            onPress={() => navigation.navigate('PartyDetail', { partyId: item.party.id })}
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
