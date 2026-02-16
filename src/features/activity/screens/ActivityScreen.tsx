import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { TabsParamList } from '../../../navigation/types';
import { useAuth } from '../../../lib/supabase/hooks/useAuth';
import { useActivityFeed } from '../hooks/useActivityFeed';
import { ActivityIndicator, View, Text, SectionList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, EmptyState } from '../../../components';
import ActivityListItem from '../components/ActivityListItem';

type Props = BottomTabScreenProps<TabsParamList, 'Activity'>;

export default function ActivityScreen({ navigation }: Props) {
  const { session } = useAuth();
  const userId = session?.user?.id ?? null;
  const { sections, loading, error, refetch } = useActivityFeed(userId);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-neutral-50">
        <ActivityIndicator />
      </View>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center px-6 bg-neutral-50">
        <Text className="text-center text-neutral-600 mb-4">
          Failed to load activity.
        </Text>
        <Button title="Retry" variant="outline" onPress={refetch} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-neutral-50">
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 8,
          paddingBottom: 120,
        }}
        stickySectionHeadersEnabled={false}
        refreshing={loading}
        onRefresh={refetch}
        ListHeaderComponent={
          <Text className="text-2xl font-bold text-slate-900 mb-3">
            Activity
          </Text>
        }
        ListEmptyComponent={
          <EmptyState
            icon="bell"
            title="No activity yet"
            message="New link and party activity will appear here."
          />
        }
        renderSectionHeader={({ section }) => (
          <Text className="text-xs font-semibold uppercase tracking-wider text-slate-500 mt-3 mb-2">
            {section.title}
          </Text>
        )}
        renderItem={({ item }) => (
          <ActivityListItem
            item={item}
            onPress={
              item.link_id && item.party_id
                ? () =>
                    navigation.navigate('Link', {
                      screen: 'LinkDetail',
                      params: { linkId: item.link_id, partyId: item.party_id },
                    })
                : item.party_id
                  ? () =>
                      navigation.navigate('Party', {
                        screen: 'PartyDetail',
                        params: { partyId: item.party_id },
                      })
                  : undefined
            }
          />
        )}
      />
    </SafeAreaView>
  );
}
