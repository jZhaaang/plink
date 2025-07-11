import { useUserId } from '@/lib/supabase/hooks';
import useParties from '@/lib/supabase/hooks/useParties';
import { addLinkMember, createLink } from '@/lib/supabase/queries';
import type { RootStackParamList } from '@/navigation/AppNavigator';
import { Picker } from '@react-native-picker/picker';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';

type Route = RouteProp<RootStackParamList, 'CreateLink'>;
type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function CreateLinkScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const prefilledPartyId = route.params?.partyId ?? null;
  const { userId } = useUserId();

  const { parties, loading } = useParties();
  const [partyId, setPartyId] = useState(prefilledPartyId ?? '');
  const [linkName, setLinkName] = useState('');
  const [location, setLocation] = useState('');

  useEffect(() => {
    if (prefilledPartyId) setPartyId(prefilledPartyId);
  }, [prefilledPartyId]);

  const handleSubmit = async () => {
    if (!userId || !partyId || !linkName) return;

    const { data: link, error: linkError } = await createLink({
      party_id: partyId,
      created_by: userId,
      name: linkName,
      location,
    });

    if (!link || linkError) return;

    const { error } = await addLinkMember({ user_id: userId, link_id: link.id });

    if (error) return;

    navigation.navigate('LinkDetail', { partyId: partyId, linkId: link.id });
  };

  return (
    <ScrollView className="flex-1 bg-white px-6 pt-6">
      <View className="rounded-xl border border-gray-300 p-4 space-y-6 bg-white">
        <Text className="text-lg font-semibold">Party</Text>
        <View className="border rounded-md border-gray-300">
          <Picker selectedValue={partyId} onValueChange={(itemValue) => setPartyId(itemValue)}>
            {parties.map((p) => (
              <Picker.Item key={p.id} label={p.name} value={p.id} />
            ))}
          </Picker>
        </View>

        <Text className="text-lg font-semibold">Link Name</Text>
        <TextInput
          className="border border-gray-300 rounded-md p-3"
          placeholder="Enter a name"
          value={linkName}
          onChangeText={setLinkName}
        />

        <Text className="text-lg font-semibold">Location</Text>
        <TextInput
          className="border border-gray-300 rounded-md p-3"
          placeholder="Where are you?"
          value={location}
          onChangeText={setLocation}
        />

        <Pressable
          onPress={handleSubmit}
          className="bg-purple-200 py-4 rounded-xl items-center shadow-md"
        >
          <Text className="text-purple-800 font-bold text-lg">+ Start a Link</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
