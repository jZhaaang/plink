import { useUserId } from '@/lib/supabase/hooks';
import { useLinkOverviews } from '@/lib/supabase/hooks/useLinkOverviews';
import { RootStackParamList } from '@/navigation/AppNavigator';
import { LinkMetaCard, LinkPostComposer, LinkPostItem } from '@/ui/components/Link';
import { Section } from '@/ui/components/Section';
import { RouteProp, useRoute } from '@react-navigation/native';
import { ActivityIndicator, FlatList, View } from 'react-native';

type Route = RouteProp<RootStackParamList, 'LinkDetail'>;

export default function LinkDetailScreen() {
  const { linkId } = useRoute<Route>().params;
  const { userId, loading: userLoading } = useUserId();
  const { linkOverview, loading: overviewLoading } = useLinkOverviews({ linkId });

  if (userLoading || overviewLoading || !linkOverview || !userId) return <ActivityIndicator />;

  const handleSubmit = async (comment: string, images: string[]) => {};

  return (
    <FlatList
      className="flex-1 bg-white"
      ListHeaderComponent={
        <View className="px-4 pt-4">
          <LinkMetaCard linkOverview={linkOverview} />
          {linkOverview.posts.length > 0 && <Section title="Link Feed" />}
        </View>
      }
      data={linkOverview.posts}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View className="px-4 py-2">
          <LinkPostItem post={item} currentUserId={userId} />
        </View>
      )}
      ListEmptyComponent={
        <View className="px-4 py-2">
          <Section title="No posts yet. Be the first to add something!" />
        </View>
      }
      ListFooterComponent={
        <View className="pt-4 pb-8">
          <LinkPostComposer onSubmit={handleSubmit} />
        </View>
      }
    />
  );
}
