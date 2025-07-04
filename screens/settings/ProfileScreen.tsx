import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import { Alert, Button, StyleSheet, Text, TextInput, View } from 'react-native';

export default function ProfileScreen() {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('users')
        .select('name')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error.message);
      } else {
        setName(data?.name || '');
      }

      setLoading(false);
    };

    loadProfile();
  }, []);

  const saveProfile = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('users')
      .update({ name: name })
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      Alert.alert('Update failed', error.message);
      console.log('Update failed', error.message);
    } else {
      Alert.alert('Profile updated');
      console.log('Profile updated');
    }
  };

  if (loading) return <Text>Loading profile...</Text>;
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Name</Text>
      <TextInput value={name} onChangeText={setName} style={styles.input} placeholder="Your name" />
      <Button title="Save" onPress={saveProfile} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 12 },
  label: { fontSize: 16 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 6 },
});
