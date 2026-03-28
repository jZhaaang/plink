import { View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';
import { PartyStackParamList } from '../../../navigation/types';
import { useLinkDetail } from '../hooks/useLinkDetail';
import { LinkPostMedia } from '../../../lib/models';
import {
  DataFallbackScreen,
  EmptyState,
  LoadingScreen,
  MediaGrid,
  Spinner,
} from '../../../components';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { useLinkPosts } from '../hooks/useLinkPosts';

type Props = NativeStackScreenProps<PartyStackParamList, 'AllMedia'>;

export default function AllMediaScreen({ route, navigation }: Props) {
  const { linkId } = route.params;
  const { theme } = useUnistyles();

  const { linkDetail } = useLinkDetail(linkId);
  const {
    allMedia,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    loading,
    error,
    refetch,
  } = useLinkPosts(linkId);

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
              <Feather
                name="arrow-left"
                size={theme.iconSizes.md}
                color={theme.colors.darkGray}
              />
            </View>
          </Pressable>

          <View style={styles.titleWrap}>
            <Text style={styles.screenTitle} numberOfLines={1}>
              All Items
            </Text>
            <Text style={styles.screenSubtitle} numberOfLines={1}>
              {linkDetail?.name ?? 'Link'} • {allMedia.length} items
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.gridWrap}>
        <MediaGrid
          media={allMedia}
          onMediaPress={handleMediaPress}
          columns={3}
          scrollEnabled
          contentContainerStyle={styles.container}
          ListHeaderComponent={() => (
            <View style={styles.gridHeader}>
              <Text style={styles.gridHeaderText}>Latest uploads</Text>
            </View>
          )}
          ListEmptyComponent={
            error ? (
              <DataFallbackScreen onAction={refetch} />
            ) : loading ? (
              <Spinner style={{ paddingVertical: theme.spacing.xl }} />
            ) : (
              <EmptyState icon="camera" title="No items were uploaded" />
            )
          }
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) fetchNextPage();
          }}
          onEndReachedThreshold={0.5}
          ListFooterComponent={() =>
            !isFetchingNextPage ? (
              <Spinner style={{ paddingVertical: theme.spacing.xl }} />
            ) : (
              <View />
            )
          }
        />
      </View>
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
  gridWrap: {
    flex: 1,
  },
  container: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing['3xl'],
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
