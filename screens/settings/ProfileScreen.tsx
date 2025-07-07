import { getUserById, supabase, updateUser } from '@/lib/supabase';
import { Button, Container, Input } from '@/ui';
import { useEffect, useState } from 'react';
import { Alert, Text } from 'react-native';

export default function ProfileScreen() {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData.session?.user;
      if (!user) return;

      const { data: userData } = await getUserById(user.id);

      setName(userData?.name || '');

      setLoading(false);
    };

    loadProfile();
  }, []);

  const saveProfile = async () => {
    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData.session?.user;
    if (!user) return;

    await updateUser(user.id, { name: name });

    Alert.alert('Profile updated');
  };

  if (loading) return <Text>Loading profile...</Text>;
  return (
    <Container>
      <Text className="text-lg font-semibold my-4">Name</Text>
      <Input placeholder="Your Name" value={name} onChangeText={setName} className="my-2" />
      <Button title="Save" onPress={saveProfile} />
    </Container>
  );
}
