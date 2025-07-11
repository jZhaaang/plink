import { useLinkDetail, useUserId } from '@/lib/supabase/hooks/';
import { useResolvedPostsWithUrls } from '@/lib/supabase/hooks/useResolvedPostsWithUrls';
import { createLinkPost, deleteLinkPost, supabase, updateLinkPost } from '@/lib/supabase/queries/';
import { RootStackParamList } from '@/navigation/AppNavigator';
import { LinkPost } from '@/types/models';
import { LinkHeader, LinkPostItem, PhotoPreviewGrid, PostComposer } from '@/ui/components';
import { RouteProp, useRoute } from '@react-navigation/native';
import { ActivityIndicator, Alert, ScrollView } from 'react-native';
import uuid from 'react-native-uuid';

type Route = RouteProp<RootStackParamList, 'LinkDetail'>;

export default function LinkDetailScreen() {
  const { partyId, linkId } = useRoute<Route>().params;

  const { userId, loading: userLoading } = useUserId();
  const {
    party,
    link,
    members,
    posts,
    loading: dataLoading,
    error,
    refetch,
  } = useLinkDetail(partyId, linkId);
  const { resolvedPosts, loading: postsLoading } = useResolvedPostsWithUrls(posts);

  const loading = userLoading || dataLoading || postsLoading;

  const submitPost = async (comment: string, imageUris: string[]) => {
    if (!userId) return;

    const { data: newPost, error: insertError } = await createLinkPost({
      link_id: linkId,
      user_id: userId,
      comment,
    });

    if (insertError || !newPost) {
      console.error('Error creating post:', insertError?.message);
      return;
    }

    const postId = newPost.id;
    const uploadedPaths: string[] = [];

    for (const uri of imageUris) {
      const fileName = `${partyId}/${linkId}/${userId}/${uuid.v4()}.jpg`;
      const response = await fetch(uri);
      const blob = await response.blob();
      const arrayBuffer = await new Response(blob).arrayBuffer();

      const { error: uploadError } = await supabase.storage
        .from('link-posts')
        .upload(fileName, arrayBuffer, {
          contentType: 'image/jpeg',
          upsert: false,
          metadata: { party_id: partyId, link_id: linkId, user_id: userId },
        });

      if (uploadError) {
        console.error('Upload failed:', uploadError.message);
        continue;
      }

      uploadedPaths.push(fileName);
    }

    if (uploadedPaths.length > 0) {
      const { error } = await updateLinkPost(postId, { image_paths: uploadedPaths });

      if (error) console.error('Error updating post with image paths:', error.message);
    }

    await refetch();
  };

  const deletePost = async (post: LinkPost) => {
    const confirm = await new Promise<boolean>((resolve) => {
      Alert.alert('Delete Post', 'Are you sure you want to delete this post and its contents?', [
        { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => resolve(true),
        },
      ]);
    });

    if (!confirm) return;

    if (post.image_paths.length > 0) {
      const { error: deleteError } = await supabase.storage
        .from('link-posts')
        .remove(post.image_paths);
      if (deleteError) {
        console.error('Error deleting image:', deleteError.message);
      }
    }

    const { error } = await deleteLinkPost(post.id);

    if (!error) await refetch();
  };

  if (loading || !link || !party) return <ActivityIndicator />;

  const photoUrls = resolvedPosts
    .flatMap((p) => p.image_paths)
    .filter((path) => path !== null)
    .slice(0, 3);

  return (
    <ScrollView className="flex-1 bg-white">
      <LinkHeader
        linkName={link.name}
        partyName={party.name}
        partyAvatar=""
        createdAt={link.created_at}
        location={link.location}
        members={members.map((m) => m.users)}
      />
      <PhotoPreviewGrid imageUrls={photoUrls} />
      {resolvedPosts.map((post, i) => (
        <LinkPostItem
          key={i}
          name={post.users.name}
          avatarUrl={post.users.avatar_url}
          createdAt={post.created_at}
          comment={post.comment}
          imageUrls={post.signed_image_urls}
          canDelete={post.user_id === userId}
          onDelete={() => deletePost(post)}
        />
      ))}
      <PostComposer onSubmit={submitPost} />
    </ScrollView>
  );
}
