import { supabase } from '@/lib/supabase';
import { router } from 'expo-router';
import { useState } from 'react';
import { Button, StyleSheet, Text, TextInput, View } from 'react-native';

export default function NewPartyScreen() {
  const [partyName, setPartyName] = useState('');
  const [loading, setLoading] = useState(false);

  const createParty = async () => {
    setLoading(true);

    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData.session?.user;
    if (!user || !partyName) return;

    const { data: party, error } = await supabase
      .from('parties')
      .insert({ name: partyName, created_by: user.id })
      .select()
      .single();

    if (error) {
      console.error('Error creating party: ', error.message);
      return;
    }

    await supabase.from('party_members').insert({
      party_id: party.id,
      user_id: user.id,
    });

    router.replace('/parties');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Party Name</Text>
      <TextInput
        placeholder="Enter party name"
        value={partyName}
        onChangeText={setPartyName}
        style={styles.input}
      />
      <Button
        title={loading ? 'Creating...' : 'Create Party'}
        onPress={createParty}
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
