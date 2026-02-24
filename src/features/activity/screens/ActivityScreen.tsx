import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { TabsParamList } from '../../../navigation/types';
import { useActivityFeed } from '../hooks/useActivityFeed';
import { Text, SectionList, View, Pressable } from 'react-native';
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
import * as Burnt from 'burnt';
import { StyleSheet } from 'react-native-unistyles';

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
      Burnt.toast({ title: 'Activity cleared', preset: 'done', haptic: 'success' });
    } catch (err) {
      logger.error('Error deleting activity', { err });
      await dialog.error('Failed to Delete Activity', getErrorMessage(err));
    }
  };

  if (activityLoading) return <LoadingScreen label="Loading..." />;
  if (activityError) return <DataFallbackScreen onAction={refetchActivity} />;

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
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
          <View style={styles.listHeader}>
            <Text style={styles.screenTitle}>Activity</Text>
            {sections.length > 0 && (
              <Pressable onPress={clearAll}>
                <Text style={styles.clearText}>Clear All</Text>
              </Pressable>
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
          <Text style={styles.sectionHeader}>{section.title}</Text>
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

const styles = StyleSheet.create((theme) => ({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  screenTitle: {
    fontSize: theme.fontSizes['2xl'],
    fontWeight: theme.fontWeights.bold,
    color: theme.colors.textPrimary,
  },
  clearText: {
    fontSize: theme.fontSizes.sm,
    fontWeight: theme.fontWeights.medium,
    color: theme.colors.error,
  },
  sectionHeader: {
    fontSize: theme.fontSizes.xs,
    fontWeight: theme.fontWeights.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    color: theme.colors.textTertiary,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
}));
