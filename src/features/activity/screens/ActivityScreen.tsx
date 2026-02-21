import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { TabsParamList } from '../../../navigation/types';
import { useActivityFeed } from '../hooks/useActivityFeed';
import { Text, SectionList, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  DataFallbackScreen,
  EmptyState,
  LoadingScreen,
} from '../../../components';
import ActivityListItem from '../components/ActivityListItem';
import { useAuth } from '../../../providers/AuthProvider';
import { useDialog } from '../../../providers/DialogProvider';
import { useInvalidate } from '../../../lib/supabase/hooks/useInvalidate';
import { deleteAllActivityEvents } from '../../../lib/supabase/queries/activity';
import { logger } from '../../../lib/telemetry/logger';
import { getErrorMessage } from '../../../lib/utils/errorExtraction';

type Props = BottomTabScreenProps<TabsParamList, 'Activity'>;

export default function ActivityScreen({ navigation }: Props) {
  const { userId } = useAuth();
  const {
    sections,
    loading: activityLoading,
    error: activityError,
    refetch: refetchActivity,
  } = useActivityFeed(userId);
  const dialog = useDialog();
  const invalidate = useInvalidate();

  const clearAll = async () => {
    const confirmed = await dialog.confirmDanger(
      'Clear Activity',
      'This will clear all of your activity history. This cannot be undone.',
    );
    if (!confirmed) return;

    try {
      await deleteAllActivityEvents(userId);
      invalidate.activity();
    } catch (err) {
      logger.error('Error deleting activity', { err });
      await dialog.error('Failed to Delete Activity', getErrorMessage(err));
    }
  };

  if (activityLoading) return <LoadingScreen label="Loading..." />;
  if (activityError) return <DataFallbackScreen onAction={refetchActivity} />;

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
        refreshing={activityLoading}
        onRefresh={refetchActivity}
        ListHeaderComponent={
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-2xl font-bold text-slate-900">Activity</Text>
            {sections.length > 0 && (
              <TouchableOpacity onPress={clearAll}>
                <Text className="text-sm font-medium text-red-500">
                  Clear All
                </Text>
              </TouchableOpacity>
            )}
          </View>
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
