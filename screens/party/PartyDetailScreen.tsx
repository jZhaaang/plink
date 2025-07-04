import { supabase } from '@/lib/supabase';
import { RootStackParamList } from '@/navigation/AppNavigator';
import { Database } from '@/types/supabase';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState } from 'react';
import { ActivityIndicator, Button, Pressable, StyleSheet, Text, View } from 'react-native';

type Route = RouteProp<RootStackParamList, 'PartyDetail'>;
type Nav = NativeStackNavigationProp<RootStackParamList>;
type Link = Database['public']['Tables']['links']['Row'];

export default function PartyDetailScreen() {
  const { params } = useRoute<Route>();
  const partyId = params.partyId;
  const navigation = useNavigation<Nav>();
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
                navigation.navigate('LinkDetail', {
                  partyId: partyId,
                  linkId: link.id,
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
          navigation.navigate('CreateLink', {
            partyId: partyId,
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
