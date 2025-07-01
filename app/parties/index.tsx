import { supabase } from '@/lib/supabase';
import { Database } from '@/types/supabase';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Button, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

type Party = Database['public']['Tables']['parties']['Row'];

export default function PartyList() {
  const [parties, setParties] = useState<Party[]>([]);
  const [newName, setNewName] = useState('');

  useEffect(() => {
    const loadParties = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: parties } = await supabase
        .from('party_members')
        .select('party_id, parties (id, name)')
        .eq('user_id', user.id);

      const partyIds = parties?.map((party) => party.party_id) ?? [];

      const { data, error } = await supabase.from('parties').select('*').in('id', partyIds);

      if (!error && data) {
        setParties(data);
      } else {
        console.error('Error getting parties:', error.message);
      }
    };

    loadParties();
  }, []);

  const createParty = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const user = session?.user;
    if (!user || !newName) return;
    console.log('user.id:', user?.id);
    console.log('auth.uid():', session?.user.id);

    console.log('Creating party with user ID:', user.id);

    const { data: party, error } = await supabase
      .from('parties')
      .insert({ name: newName, created_by: user.id })
      .select()
      .single();

    if (error || !party) {
      console.error('Error inserting party:', error.message);
      return;
    }

    await supabase.from('party_members').insert({ party_id: party.id, user_id: user.id });

    setParties((prev) => [...prev, party]);
    setNewName('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Your Parties</Text>
      {parties.map((party) => (
        <Pressable
          key={party.id}
          onPress={() =>
            router.push({
              pathname: '/parties/[id]' as any,
              params: { id: party.id },
            })
          }
          style={styles.item}
        >
          <Text>{party.name}</Text>
        </Pressable>
      ))}
      <TextInput
        placeholder="New party name"
        value={newName}
        onChangeText={setNewName}
        style={styles.input}
      />
      <Button title="Create Party" onPress={createParty} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 12 },
  header: { fontSize: 18, fontWeight: 'bold' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 6 },
  item: { padding: 10, backgroundColor: '#f1f1f1', borderRadius: 6, marginVertical: 4 },
});
