import { supabase } from '@/lib/supabase';
import { Database } from '@/types/supabase';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Button, StyleSheet, Text, View } from 'react-native';

type Link = Database['public']['Tables']['links']['Row'];

export default function LinkScreen() {
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
            <View key={link.id}>
              <Text>Started by: {link.created_by}</Text>
              {link.created_at && <Text>{new Date(link.created_at).toLocaleString()}</Text>}
            </View>
          ))}
        </>
      ) : (
        <Text>No active links</Text>
      )}
      <Button title="Start Link" onPress={startLink} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 12 },
  title: { fontSize: 18, fontWeight: 'bold' },
});
