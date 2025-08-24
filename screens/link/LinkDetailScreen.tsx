import { useUserId } from '@/lib/supabase/hooks';
import { useLinkOverviews } from '@/lib/supabase/hooks/useLinkOverviews';
import { createLinkPost, supabase, updateLink } from '@/lib/supabase/queries';
import { RootStackParamList } from '@/navigation/AppNavigator';
import { ConfirmModal } from '@/ui/components/ConfirmModal';
import { LinkMetaCard, LinkPostComposer, LinkPostItem } from '@/ui/components/Link';
import { Section } from '@/ui/components/Section';
import { RouteProp, useRoute } from '@react-navigation/native';
import { useState } from 'react';
import { ActivityIndicator, FlatList, View } from 'react-native';
import uuid from 'react-native-uuid';

type Route = RouteProp<RootStackParamList, 'LinkDetail'>;

export default function LinkDetailScreen() {
  const { partyId, linkId } = useRoute<Route>().params;
  const { userId, loading: userLoading } = useUserId();
  const { linkOverview, loading: overviewLoading } = useLinkOverviews({ linkId });

  const [confirmVisible, setConfirmVisible] = useState(false);
  const [confirmAction, setConfirmAction] = useState<() => void>(() => {});
  const [confirmConfig, setConfirmConfig] = useState({ title: '', message: '' });

  const showConfirm = ({
    title,
    message,
    onConfirm,
  }: {
    title: string;
    message: string;
    onConfirm: () => void;
  }) => {
    setConfirmConfig({ title, message });
    setConfirmAction(() => () => {
      setConfirmVisible(false);
      onConfirm();
    });
    setConfirmVisible(true);
  };

  if (userLoading || overviewLoading || !linkOverview || !userId) return <ActivityIndicator />;

  const handleSubmit = async (comment: string, imageUris: string[]) => {
    const imagePaths = [];

    for (const uri of imageUris) {
      const fileName = `${partyId}/${linkId}/${userId}/${uuid.v4()}.jpg`;
      const response = await fetch(uri);
      const blob = await response.blob();
      const arrayBuffer = await new Response(blob).arrayBuffer();

      const { error } = await supabase.storage.from('link-posts').upload(fileName, arrayBuffer, {
        contentType: 'image/jpeg',
        upsert: false,
        metadata: { party_id: partyId, link_id: linkId, user_id: userId },
      });

      if (error) {
        console.error('Upload failed:', error.message);
        continue;
      }

      imagePaths.push(fileName);
    }

    const { data: post, error } = await createLinkPost({
      link_id: linkId,
      user_id: userId,
      comment,
      image_paths: imagePaths,
    });

    if (error || !post) {
      console.error('Error creating post:', error?.message);
      return;
    }
  };

  const handleEndLink = async () => {
    const { error } = await updateLink(linkId, { is_active: false });
    if (error) console.error('Failed to end link:', error.message);
  };

  const handlePressEndLink = () => {
    showConfirm({
      title: 'End Link?',
      message: 'This will end the link for everyone',
      onConfirm: handleEndLink,
    });
  };

  return (
    <>
      <FlatList
        className="flex-1 bg-white"
        ListHeaderComponent={
          <View className="px-4 pt-4">
            <LinkMetaCard linkOverview={linkOverview} onPressEndLink={handlePressEndLink} />
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
      <ConfirmModal
        visible={confirmVisible}
        title={confirmConfig.title}
        message={confirmConfig.message}
        onCancel={() => setConfirmVisible(false)}
        onConfirm={confirmAction}
      />
    </>
  );
}
