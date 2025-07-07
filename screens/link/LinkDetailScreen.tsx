import {
  createLinkPost,
  getLinkById,
  getLinkMembers,
  getLinkPosts,
  supabase,
  updateLink,
} from '@/lib/supabase';
import { RootStackParamList } from '@/navigation/AppNavigator';
import { Database } from '@/types/supabase';
import { Button, Card, Container, Input } from '@/ui';
import { RouteProp, useRoute } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Text, View } from 'react-native';

type Route = RouteProp<RootStackParamList, 'LinkDetail'>;
type Link = Database['public']['Tables']['links']['Row'];
type LinkMember = Database['public']['Tables']['link_members']['Row'] & {
  users: { name: string | null };
};
type LinkPost = Database['public']['Tables']['link_posts']['Row'] & {
  users: { name: string | null };
};

export default function LinkDetailScreen() {
  const { linkId } = useRoute<Route>().params;

  const [link, setLink] = useState<Link | null>(null);
  const [members, setMembers] = useState<LinkMember[]>([]);
  const [posts, setPosts] = useState<LinkPost[]>([]);

  const [newPost, setNewPost] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      const { data: link } = await getLinkById(linkId);
      const { data: members } = await getLinkMembers(linkId);
      const { data: posts } = await getLinkPosts(linkId);

      if (link) setLink(link);
      if (members) setMembers(members);
      if (posts) setPosts(posts);

      setLoading(false);
    };

    fetchData();
  }, [linkId]);

  const submitPost = async () => {
    if (!newPost.trim()) return;

    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData.session?.user;
    if (!user) return;

    const { data } = await createLinkPost({ content: newPost, link_id: linkId, user_id: user.id });

    if (data) {
      setPosts((prev) => [...prev, data]);
      setNewPost('');
    }
  };

  const endLink = async () => {
    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData.session?.user;
    if (!user) return;

    await updateLink(linkId, { is_active: false });

    Alert.alert('Link ended');
  };

  if (loading) return <ActivityIndicator />;

  return (
    <Container>
      <Text className="text-xl font-bold mt-4">{link?.name}</Text>
      <Text className="text-sm text-gray-500">
        Started at {new Date(link?.created_at ?? '').toLocaleString()}
      </Text>

      <Button title="End Link" onPress={endLink} className="mt-2" />

      <Text className="text-base font-semibold mt-4">Members</Text>
      <View className="mb-2">
        {members.map((member) => (
          <Text key={member.user_id}>• {member.users.name}</Text>
        ))}
      </View>

      <Text className="text-base font-semibold mt-2">Posts</Text>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card className="mb-2">
            <Text className="font-semibold">{item.users.name}</Text>
            <Text>{item.content}</Text>
            <Text className="text-xs text-gray-500">
              {new Date(item.created_at ?? '').toLocaleTimeString()}
            </Text>
          </Card>
        )}
      />

      <Input
        placeholder="Write a post..."
        value={newPost}
        onChangeText={setNewPost}
        className="mt-4"
      />

      <Button title="Post" onPress={submitPost} className="mt-2" />
    </Container>
  );
}
