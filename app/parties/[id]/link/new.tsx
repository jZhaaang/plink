import { supabase } from '@/lib/supabase';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Button, StyleSheet, Text, TextInput, View } from 'react-native';

export default function NewLinkScreen() {
  const { id } = useLocalSearchParams();
  const partyId = Array.isArray(id) ? id[0] : id;
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const createLink = async () => {
    setLoading(true);

    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData.session?.user;
    if (!user || !name) return;

    const { data: link, error } = await supabase
      .from('links')
      .insert({
        name,
        party_id: partyId,
        created_by: user.id,
        is_active: true,
      })
      .select()
      .single();

    setLoading(false);

    if (error) {
      console.error('Failed to create link:', error.message);
      return;
    }

    await supabase.from('link_members').insert({
      link_id: link.id,
      user_id: user.id,
    });

    router.replace({
      pathname: '/parties/[id]/link/[linkId]',
      params: { id: partyId, linkId: link.id },
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Link Name</Text>
      <TextInput
        placeholder="What’s this link about?"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />
      <Button
        title={loading ? 'Creating...' : 'Create Link'}
        onPress={createLink}
        disabled={loading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 12 },
  label: { fontWeight: 'bold' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 6 },
});
