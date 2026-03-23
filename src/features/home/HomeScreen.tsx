import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as Burnt from 'burnt';
import { useAuth } from '../../providers/AuthProvider';
import { HomeStackParamList } from '../../navigation/types';
import { useInvalidate } from '../../lib/supabase/hooks/useInvalidate';
import { useHomeFeed } from './hooks/useHomeFeed';
import { useDialog } from '../../providers/DialogProvider';
import { createLinkMember } from '../../lib/supabase/queries/linkMembers';
import { trackEvent } from '../../lib/telemetry/analytics';
import { logger } from '../../lib/telemetry/logger';
import { getErrorMessage } from '../../lib/utils/errorExtraction';
import {
  DataFallbackScreen,
  Divider,
  EmptyState,
  LoadingScreen,
  SectionHeader,
} from '../../components';
import HomeLinkCard from './components/HomeLinkCard';
import ActiveLinkCard from './components/ActiveLinkCard';

type Props = NativeStackScreenProps<HomeStackParamList, 'HomeFeed'>;

export default function HomeScreen({ navigation }: Props) {
  const { userId } = useAuth();
  const dialog = useDialog();
  const insets = useSafeAreaInsets();
  const invalidate = useInvalidate();

  const {
    feedLinks,
    activeLinks,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    loading,
    error,
    refetch,
  } = useHomeFeed(userId);

  const navigateToLink = (linkId: string, partyId: string) => {
    navigation.navigate('LinkDetail', { linkId, partyId });
  };

  const handleJoin = async (linkId: string, partyId: string) => {
    const confirmed = await dialog.confirmAsk(
      'Join Link?',
      'Become an active participant in the ongoing link.',
    );
    if (!confirmed) return;

    try {
      await createLinkMember({ link_id: linkId, user_id: userId });
      trackEvent('link_joined', { link_id: linkId });
      invalidate.homeActiveLinks();
      invalidate.linkDetail(linkId);
      invalidate.activeLink();
      Burnt.toast({ title: 'Joined link', preset: 'done', haptic: 'success' });
      navigateToLink(linkId, partyId);
    } catch (err) {
      logger.error('Error joining link', { err });
      await dialog.error('Failed to Join Link', getErrorMessage(err));
    }
  };

  if (loading) return <LoadingScreen label="Loading..." />;
  if (error || !feedLinks || !activeLinks)
    return <DataFallbackScreen onAction={refetch} />;

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.container}>
        <Text style={styles.screenTitle}>Home</Text>
        <Divider />
        <FlatList
          data={feedLinks}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          stickyHeaderIndices={[0]}
          ListHeaderComponent={
            <View style={styles.header}>
              {activeLinks.length > 0 && (
                <>
                  <View style={styles.activeSection}>
                    <SectionHeader
                      title="Active Now"
                      count={activeLinks.length > 1 ? activeLinks.length : null}
                    />
                    {activeLinks.length === 1 ? (
                      <ActiveLinkCard
                        link={activeLinks[0]}
                        isMember={activeLinks[0].members.some(
                          (m) => m.id === userId,
                        )}
                        onPress={() =>
                          navigateToLink(
                            activeLinks[0].id,
                            activeLinks[0].party_id,
                          )
                        }
                        onJoin={() =>
                          handleJoin(activeLinks[0].id, activeLinks[0].party_id)
                        }
                      />
                    ) : (
                      <FlatList
                        data={activeLinks}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        snapToAlignment="start"
                        decelerationRate="fast"
                        keyExtractor={(link) => link.id}
                        renderItem={({ item: link }) => (
                          <ActiveLinkCard
                            peek
                            link={link}
                            isMember={link.members.some((m) => m.id === userId)}
                            onPress={() =>
                              navigateToLink(link.id, link.party_id)
                            }
                            onJoin={() => handleJoin(link.id, link.party_id)}
                          />
                        )}
                      />
                    )}
                  </View>

                  <Divider style={{ marginVertical: 12 }} />
                </>
              )}

              <SectionHeader title="Recent Links" />
            </View>
          }
          renderItem={({ item }) => (
            <HomeLinkCard
              link={item}
              onPress={() => navigateToLink(item.id, item.party_id)}
              onMediaPress={() =>
                navigation.navigate('AllMedia', { linkId: item.id })
              }
            />
          )}
          ListEmptyComponent={
            <EmptyState
              icon="link"
              title="No links yet"
              message="Join a party and start sharing links!"
            />
          }
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) fetchNextPage();
          }}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isFetchingNextPage ? (
              <ActivityIndicator style={{ paddingVertical: 20 }} />
            ) : null
          }
          refreshing={loading}
          onRefresh={refetch}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  root: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.lg,
  },
  screenTitle: {
    fontSize: theme.fontSizes.xl,
    fontWeight: theme.fontWeights.bold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.lg,
  },

  header: {
    backgroundColor: theme.colors.background,
    paddingTop: theme.spacing.md,
  },
  activeSection: {
    backgroundColor: theme.colors.background,
  },
}));
