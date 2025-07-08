import {
  createLinkPost,
  deleteLinkPost,
  getLinkById,
  getLinkMembers,
  getLinkPosts,
  getPartyById,
  supabase,
  updateLinkPost,
} from '@/lib/supabase';
import { RootStackParamList } from '@/navigation/AppNavigator';
import { Database } from '@/types/supabase';
import { LinkHeader, LinkPostItem } from '@/ui/components';
import PhotoPreviewGrid from '@/ui/components/PhotoPreviewGrid';
import PostComposer from '@/ui/components/PostComposer';
import { RouteProp, useRoute } from '@react-navigation/native';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView } from 'react-native';
import uuid from 'react-native-uuid';

type Route = RouteProp<RootStackParamList, 'LinkDetail'>;
type Party = Database['public']['Tables']['parties']['Row'];
type Link = Database['public']['Tables']['links']['Row'];
type LinkMember = Database['public']['Tables']['link_members']['Row'] & {
  users: { name: string; avatar_url: string };
};
type LinkPost = Database['public']['Tables']['link_posts']['Row'] & {
  users: { name: string; avatar_url: string };
};

export default function LinkDetailScreen() {
  const { partyId, linkId } = useRoute<Route>().params;
  const [userId, setUserId] = useState<string | null>(null);

  const [party, setParty] = useState<Party | null>(null);
  const [link, setLink] = useState<Link | null>(null);
  const [members, setMembers] = useState<LinkMember[]>([]);
  const [posts, setPosts] = useState<LinkPost[]>([]);

  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);

    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData.session?.user;
    const { data: party } = await getPartyById(partyId);
    const { data: link } = await getLinkById(linkId);
    const { data: members } = await getLinkMembers(linkId);
    const { data: posts } = await getLinkPosts(linkId);

    if (user) setUserId(user.id);
    if (party) setParty(party);
    if (link) setLink(link);
    if (members) setMembers(members);
    if (posts) setPosts(posts);

    setLoading(false);
  }, [partyId, linkId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const submitPost = async (comment: string, imageUris: string[]) => {
    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData.session?.user;
    if (!user) return;

    const { data: newPost, error: insertError } = await createLinkPost({
      link_id: linkId,
      user_id: user.id,
      comment,
    });

    if (insertError || !newPost) {
      console.error('Error creating post:', insertError?.message);
      return;
    }

    const postId = newPost.id;
    const uploadedUrls: string[] = [];

    for (const uri of imageUris) {
      const fileName = `${partyId}/${linkId}/${user.id}/${uuid.v4()}.jpg`;
      const response = await fetch(uri);
      const blob = await response.blob();
      const arrayBuffer = await new Response(blob).arrayBuffer();

      const { error: uploadError } = await supabase.storage
        .from('link-posts')
        .upload(fileName, arrayBuffer, {
          contentType: 'image/jpeg',
          upsert: false,
          metadata: { link_id: linkId },
        });

      if (uploadError) {
        console.error('Upload failed:', uploadError.message);
        continue;
      }

      const { data, error } = await supabase.storage
        .from('link-posts')
        .createSignedUrl(fileName, 60 * 60 * 24);

      if (error) console.error('Error getting signed URL:', error.message);

      if (data?.signedUrl) {
        uploadedUrls.push(data.signedUrl);
      }
    }

    if (uploadedUrls.length > 0) {
      const { error } = await updateLinkPost(postId, { image_urls: uploadedUrls });
      console.log(uploadedUrls);

      if (error) console.error('Error updating post with image URLs:', error.message);
    }

    fetchData();
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

    const objectPaths = post.image_urls.map((url) => {
      const path = url.split('/').slice(-2).join('/');
      return path;
    });

    if (objectPaths.length > 0) {
      const { error: deleteError } = await supabase.storage.from('link-posts').remove(objectPaths);
      if (deleteError) {
        console.error('Error deleting image:', deleteError.message);
      }
    }

    const { error } = await deleteLinkPost(post.id);

    if (!error) await fetchData();
  };

  if (loading || !link || !party) return <ActivityIndicator />;

  const photoUrls = posts
    .flatMap((p) => p.image_urls)
    .filter((url) => url !== null)
    .slice(0, 3);

  return (
    <ScrollView className="flex-1 bg-white">
      <LinkHeader
        linkName={link.name}
        partyName={party.name}
        partyAvatar=""
        createdAt={link.created_at}
        location="test"
        members={members.map((m) => m.users)}
      />
      <PhotoPreviewGrid imageUrls={photoUrls} />
      {posts.map((post, i) => (
        <LinkPostItem
          key={i}
          name={post.users.name}
          avatarUrl={post.users.avatar_url}
          createdAt={post.created_at}
          comment={post.comment}
          imageUrls={post.image_urls}
          canDelete={post.user_id === userId}
          onDelete={() => deletePost(post)}
        />
      ))}
      <PostComposer onSubmit={submitPost} />
    </ScrollView>
  );
}
