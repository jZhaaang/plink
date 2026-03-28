import { TabsParamList } from '../../../navigation/types';
import { useActivityFeed } from '../hooks/useActivityFeed';
import { Text, SectionList, View, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  DataFallbackScreen,
  Divider,
  EmptyState,
  LoadingScreen,
} from '../../../components';
import ActivityCard from '../components/ActivityCard';
import { useAuth } from '../../../providers/AuthProvider';
import { useDialog } from '../../../providers/DialogProvider';
import { useInvalidate } from '../../../lib/supabase/hooks/useInvalidate';
import { deleteAllActivityEvents } from '../../../lib/supabase/queries/activity';
import { logger } from '../../../lib/telemetry/logger';
import { getErrorMessage } from '../../../lib/utils/errorExtraction';
import * as Burnt from 'burnt';
import { StyleSheet } from 'react-native-unistyles';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';

export default function ActivityScreen() {
  const { userId } = useAuth();
  const tabNav = useNavigation<NativeStackNavigationProp<TabsParamList>>();
  const dialog = useDialog();
  const insets = useSafeAreaInsets();

  const invalidate = useInvalidate();
  const {
    sections,
    loading: activityLoading,
    error: activityError,
    refetch: refetchActivity,
  } = useActivityFeed(userId);
  const clearAll = async () => {
    const confirmed = await dialog.confirmDanger(
      'Clear Activity',
      'This will clear all of your activity history. This cannot be undone.',
    );
    if (!confirmed) return;

    try {
      await deleteAllActivityEvents(userId);
      invalidate.activity();
      Burnt.toast({
        title: 'Activity cleared',
        preset: 'done',
        haptic: 'success',
      });
    } catch (err) {
      logger.error('Error deleting activity', { err });
      await dialog.error('Failed to Delete Activity', getErrorMessage(err));
    }
  };

  if (activityLoading) return <LoadingScreen label="Loading..." />;
  if (activityError) return <DataFallbackScreen onAction={refetchActivity} />;

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.screenTitle}>Activity</Text>
          {sections.length > 0 && (
            <Pressable onPress={clearAll}>
              <Text style={styles.clearText}>Clear All</Text>
            </Pressable>
          )}
        </View>
        <Divider />
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={styles.container}
        refreshing={activityLoading}
        onRefresh={refetchActivity}
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
          <ActivityCard
            item={item}
            onPress={
              item.link_id && item.party_id
                ? () =>
                    tabNav.navigate('Party', {
                      screen: 'LinkDetail',
                      params: {
                        linkId: item.link_id,
                        partyId: item.party_id,
                      },
                    })
                : item.party_id
                  ? () =>
                      tabNav.navigate('Party', {
                        screen: 'PartyDetail',
                        params: { partyId: item.party_id },
                      })
                  : undefined
            }
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  root: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  header: {
    paddingHorizontal: theme.spacing.lg,
  },
  headerText: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  screenTitle: {
    fontSize: theme.fontSizes.xl,
    fontWeight: theme.fontWeights.bold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.lg,
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
