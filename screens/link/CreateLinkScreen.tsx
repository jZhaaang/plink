import { addLinkMember, createLink as createLinkHelper, supabase } from '@/lib/supabase/queries/';
import { RootStackParamList } from '@/navigation/AppNavigator';
import { Button, Container, Input } from '@/ui/components';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Text } from 'react-native';

type Route = RouteProp<RootStackParamList, 'CreateLink'>;
type Nav = NativeStackNavigationProp<RootStackParamList, 'LinkDetail'>;

export default function CreateLinkScreen() {
  const { partyId } = useRoute<Route>().params;
  const navigation = useNavigation<Nav>();

  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const createLink = async () => {
    setLoading(true);

    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData.session?.user;
    if (!user || !name) return;

    const { data: link } = await createLinkHelper({
      name,
      party_id: partyId,
      created_by: user.id,
      is_active: true,
    });

    if (link) {
      await addLinkMember({ link_id: link?.id, user_id: user.id });

      navigation.navigate('LinkDetail', {
        partyId: partyId,
        linkId: link.id,
      });
    }

    setLoading(false);
  };

  return (
    <Container>
      <Text className="text-lg font-semibold my-4">Link Name</Text>
      <Input
        placeholder="What's this link about?"
        value={name}
        onChangeText={setName}
        className="mb-2"
      />
      <Button
        title={loading ? 'Creating...' : 'Create Link'}
        onPress={createLink}
        disabled={loading}
      />
    </Container>
  );
}
