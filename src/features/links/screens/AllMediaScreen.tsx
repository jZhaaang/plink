import { useMemo } from 'react';
import { View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';
import { PartyStackParamList } from '../../../navigation/types';
import { useLinkDetail } from '../hooks/useLinkDetail';
import MediaGrid from '../../../components/MediaGrid';
import { LinkPostMedia } from '../../../lib/models';
import { LoadingScreen } from '../../../components';
import { StyleSheet } from 'react-native-unistyles';

type Props = NativeStackScreenProps<PartyStackParamList, 'AllMedia'>;

export default function AllMediaScreen({ route, navigation }: Props) {
  const { linkId } = route.params;
  const { link, loading } = useLinkDetail(linkId);

  const allMedia = useMemo(() => {
    if (!link) return [];
    return link.posts.flatMap((post) => post.media);
  }, [link]);

  const handleMediaPress = (item: LinkPostMedia) => {
    const index = allMedia.findIndex((m) => m.id === item.id);
    navigation.navigate('MediaViewer', {
      linkId,
      initialIndex: index === -1 ? 0 : index,
    });
  };

  if (loading) return <LoadingScreen label="Loading..." />;

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <View style={styles.topSection}>
        <View style={styles.navRow}>
          <Pressable onPress={() => navigation.goBack()}>
            <View style={styles.backButton}>
              <Feather name="arrow-left" size={20} color="#334155" />
            </View>
          </Pressable>

          <View style={styles.titleWrap}>
            <Text style={styles.screenTitle} numberOfLines={1}>
              All Items
            </Text>
            <Text style={styles.screenSubtitle} numberOfLines={1}>
              {link?.name ?? 'Link'} • {allMedia.length} items
            </Text>
          </View>
        </View>
      </View>

      {allMedia.length === 0 ? (
        <View style={styles.emptyWrap}>
          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <Feather name="image" size={20} color="#64748b" />
            </View>
            <Text style={styles.emptyTitle}>No media yet</Text>
            <Text style={styles.emptyMessage}>
              Photos and videos shared in this link will appear here.
            </Text>
          </View>
        </View>
      ) : (
        <View style={styles.gridWrap}>
          <MediaGrid
            media={allMedia}
            onMediaPress={handleMediaPress}
            columns={3}
            scrollEnabled
            ListHeaderComponent={() => (
              <View style={styles.gridHeader}>
                <Text style={styles.gridHeaderText}>Latest uploads</Text>
              </View>
            )}
            ListFooterComponent={() => <View style={{ height: 40 }} />}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create((theme) => ({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  topSection: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.md,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: theme.radii.full,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  titleWrap: {
    flex: 1,
    paddingHorizontal: theme.spacing.md,
  },
  screenTitle: {
    fontSize: theme.fontSizes.xl,
    fontWeight: theme.fontWeights.bold,
    color: theme.colors.textPrimary,
  },
  screenSubtitle: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textTertiary,
  },
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing['2xl'],
  },
  emptyCard: {
    width: '100%',
    borderRadius: theme.radii.xl,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing['2xl'],
    alignItems: 'center',
  },
  emptyIcon: {
    width: 48,
    height: 48,
    borderRadius: theme.radii.full,
    backgroundColor: theme.colors.surfacePressed,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  emptyTitle: {
    fontSize: theme.fontSizes.base,
    fontWeight: theme.fontWeights.semibold,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  emptyMessage: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textTertiary,
    textAlign: 'center',
  },
  gridWrap: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  },
  gridHeader: {
    paddingBottom: theme.spacing.sm,
  },
  gridHeaderText: {
    fontSize: theme.fontSizes.xs,
    fontWeight: theme.fontWeights.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    color: theme.colors.textPlaceholder,
  },
}));
