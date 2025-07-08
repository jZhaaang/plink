import {
  createLinkPost,
  getLinkById,
  getLinkMembers,
  getLinkPosts,
  getPartyById,
  supabase,
  updateLink,
} from '@/lib/supabase';
import { RootStackParamList } from '@/navigation/AppNavigator';
import { Database } from '@/types/supabase';
import { LinkHeader } from '@/ui/components';
import { RouteProp, useRoute } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView } from 'react-native';

type Route = RouteProp<RootStackParamList, 'LinkDetail'>;
type Party = Database['public']['Tables']['parties']['Row'];
type Link = Database['public']['Tables']['links']['Row'];
type LinkMember = Database['public']['Tables']['link_members']['Row'] & {
  users: { name: string; avatar_url: string };
};
type LinkPost = Database['public']['Tables']['link_posts']['Row'] & {
  users: { name: string };
};

export default function LinkDetailScreen() {
  const { partyId, linkId } = useRoute<Route>().params;

  const [party, setParty] = useState<Party | null>(null);
  const [link, setLink] = useState<Link | null>(null);
  const [members, setMembers] = useState<LinkMember[]>([]);
  const [posts, setPosts] = useState<LinkPost[]>([]);

  const [newPost, setNewPost] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      const { data: party } = await getPartyById(partyId);
      const { data: link } = await getLinkById(linkId);
      const { data: members } = await getLinkMembers(linkId);
      const { data: posts } = await getLinkPosts(linkId);

      if (party) setParty(party);
      if (link) setLink(link);
      if (members) setMembers(members);
      if (posts) setPosts(posts);

      setLoading(false);
    };

    fetchData();
  }, [linkId, partyId]);

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

  if (loading || !link || !party) return <ActivityIndicator />;

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
    </ScrollView>
  );
}
