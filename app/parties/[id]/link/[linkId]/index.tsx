import { supabase } from '@/lib/supabase';
import { Database } from '@/types/supabase';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Button,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

type Link = Database['public']['Tables']['links']['Row'];
type LinkMember = Database['public']['Tables']['link_members']['Row'] & {
  users: { name: string | null };
};
type LinkPost = Database['public']['Tables']['link_posts']['Row'] & {
  users: { name: string | null };
};

export default function LinkScreen() {
  let { id, linkId } = useLocalSearchParams();
  const partyId = Array.isArray(id) ? id[0] : id;
  linkId = Array.isArray(linkId) ? linkId[0] : linkId;

  const [link, setLink] = useState<Link | null>(null);
  const [members, setMembers] = useState<LinkMember[]>([]);
  const [posts, setPosts] = useState<LinkPost[]>([]);

  const [newPost, setNewPost] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      const { data: linkData } = await supabase.from('links').select('*').eq('id', linkId).single();

      const { data: memberData } = await supabase
        .from('link_members')
        .select('user_id, link_id, joined_at, users(name)')
        .eq('link_id', linkId);

      const { data: postData } = await supabase
        .from('link_posts')
        .select('id, user_id, link_id, content, image_url, created_at, users (name)')
        .eq('link_id', linkId)
        .order('created_at', { ascending: true });

      setLink(linkData);
      setMembers(memberData || []);
      setPosts(postData || []);
      setLoading(false);
    };

    load();
    console.log(members);
  }, [linkId]);

  const submitPost = async () => {
    if (!newPost.trim()) return;

    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData.session?.user;
    if (!user) return;

    const { data, error } = await supabase
      .from('link_posts')
      .insert({
        content: newPost,
        link_id: linkId,
        user_id: user.id,
      })
      .select('id, user_id, link_id, content, image_url, created_at, users(name)')
      .single();

    if (!error) {
      setPosts((prev) => [...prev, data]);
      setNewPost('');
    }
  };

  if (loading) return <ActivityIndicator />;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{link?.name}</Text>
      <Text style={styles.subtext}>
        Started at {new Date(link?.created_at ?? '').toLocaleString()}
      </Text>

      <Text style={styles.section}>Members</Text>
      <View style={styles.memberList}>
        {members.map((m) => (
          <Text key={m.user_id}>• {m.users.name}</Text>
        ))}
      </View>

      <Text style={styles.section}>Posts</Text>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.post}>
            <Text style={styles.postAuthor}>{item.users.name}</Text>
            <Text>{item.content}</Text>
            <Text style={styles.postTime}>
              {new Date(item.created_at ?? '').toLocaleTimeString()}
            </Text>
          </View>
        )}
      />

      <TextInput
        placeholder="Write a post..."
        value={newPost}
        onChangeText={setNewPost}
        style={styles.input}
      />
      <Button title="Post" onPress={submitPost} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 12 },
  header: { fontSize: 22, fontWeight: 'bold' },
  subtext: { color: '#666' },
  section: { fontSize: 16, fontWeight: 'bold', marginTop: 10 },
  memberList: { marginBottom: 10 },
  post: {
    backgroundColor: '#f1f1f1',
    padding: 10,
    borderRadius: 6,
    marginBottom: 6,
  },
  postAuthor: { fontWeight: 'bold' },
  postTime: { fontSize: 10, color: '#666' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 6,
    marginTop: 8,
  },
});
