import { supabase } from '@/lib/supabase';
import { Database } from '@/types/supabase';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Button, Pressable, StyleSheet, Text, View } from 'react-native';

type Link = Database['public']['Tables']['links']['Row'];

export default function PartyScreen() {
  const { id } = useLocalSearchParams();
  const partyId = Array.isArray(id) ? id[0] : id;
  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLinks = async () => {
    const { data, error } = await supabase
      .from('links')
      .select('*')
      .eq('party_id', partyId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setLinks(data);
    } else {
      console.error('Error getting links:', error.message);
    }

    setLoading(false);
  };

  fetchLinks();

  const startLink = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const user = session?.user;
    if (!user) return;

    const { data, error } = await supabase
      .from('links')
      .insert({
        party_id: partyId,
        created_by: user.id,
        is_active: true,
      })
      .select();

    if (!error) {
      setLinks((prev) => [...data, ...prev]);
    } else {
      console.error('Error inserting link:', error.message);
    }
  };

  if (loading) return <ActivityIndicator />;

  return (
    <View style={styles.container}>
      <Text style={{ fontWeight: 'bold' }}>Party ID: {partyId}</Text>
      {links.length > 0 ? (
        <>
          <Text style={styles.title}>Active Links</Text>
          {links.map((link) => (
            <Pressable
              key={link.id}
              onPress={() =>
                router.push({
                  pathname: '/parties/[id]/link/[linkId]' as any,
                  params: { id: partyId, linkId: link.id },
                })
              }
              style={styles.item}
            >
              <Text>{link.name}</Text>
            </Pressable>
          ))}
        </>
      ) : (
        <Text>No active links</Text>
      )}
      <Button
        title="Start Link"
        onPress={() =>
          router.push({
            pathname: '/parties/[id]/link/new',
            params: { id: partyId },
          })
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 12 },
  title: { fontSize: 18, fontWeight: 'bold' },
  header: { fontSize: 18, fontWeight: 'bold' },
  item: { padding: 10, backgroundColor: '#f1f1f1', borderRadius: 6, marginVertical: 4 },
});
