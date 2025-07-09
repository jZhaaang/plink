import { useUserId } from '@/lib/supabase/hooks';
import {
  addPartyMember,
  createParty as createPartyHelper,
  supabase,
} from '@/lib/supabase/queries/';
import { RootStackParamList } from '@/navigation/AppNavigator';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Image, Pressable, Text, TextInput, View } from 'react-native';
import uuid from 'react-native-uuid';

type Nav = NativeStackNavigationProp<RootStackParamList, 'PartyDetail'>;
const defaultAvatarUrl =
  'https://cynsxnduvafbkcocacrq.supabase.co/storage/v1/object/public/public-assets//default-group-avatar.png';

export default function CreatePartyScreen() {
  const navigation = useNavigation<Nav>();
  const { userId } = useUserId();

  const [name, setName] = useState('');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [bannerUri, setBannerUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const avatarToDisplay = avatarUri || defaultAvatarUrl;

  const pickImage = async (setImage: (uri: string) => void) => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'] });
    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const uploadImage = async (uri: string, path: string) => {
    const response = await fetch(uri);
    const blob = await response.blob();
    const arrayBuffer = await new Response(blob).arrayBuffer();
    const { error } = await supabase.storage.from('avatars').upload(path, arrayBuffer, {
      contentType: 'image/jpeg',
      upsert: true,
    });
    if (error) throw error;
    return supabase.storage.from('avatars').getPublicUrl(path).data.publicUrl;
  };

  const createParty = async () => {
    if (!userId || !name) return;
    setLoading(true);

    try {
      const id = uuid.v4();
      const avatarPath = `avatars/${id}.jpg`;
      const bannerPath = `banners/${id}.jpg`;

      const [avatarUrl, bannerUrl] = await Promise.all([
        uploadImage(avatarToDisplay, avatarPath),
        bannerUri ? uploadImage(bannerUri, bannerPath) : null,
      ]);

      const { data: party, error: createError } = await createPartyHelper({
        id,
        name,
        created_by: userId,
        avatar_url: avatarUrl,
        banner_url: bannerUrl,
      });
      if (!party || createError) throw createError;

      await addPartyMember({ party_id: party.id, user_id: userId });
    } catch (err) {
      console.error('Error creating party:', err);
    } finally {
      setLoading(false);
      navigation.navigate('PartyList');
    }
  };

  return (
    <View className="flex-1 p-4 bg-white">
      <View className="h-40 w-full bg-gray-200 rounded-xl mb-12">
        {bannerUri && <Image source={{ uri: bannerUri }} className="w-full h-full" />}
        <Image
          source={{ uri: avatarToDisplay }}
          className="absolute bottom-[-30] left-4 w-32 h-32 rounded-full border border-white bg-gray-100"
        />
      </View>

      <TextInput
        placeholder="Party name"
        value={name}
        onChangeText={setName}
        className="border border-gray-300 rounded-md p-2 mb-4"
      />

      <Pressable onPress={() => pickImage(setAvatarUri)} className="mb-2">
        <Text className="text-blue-600">Choose Avatar</Text>
      </Pressable>

      <Pressable onPress={() => pickImage(setBannerUri)} className="mb-4">
        <Text className="text-blue-600">Choose Banner</Text>
      </Pressable>

      <Pressable
        disabled={loading || !name}
        onPress={createParty}
        className="bg-black p-4 rounded-md"
      >
        <Text className="text-white text-center font-semibold">
          {loading ? 'Creating...' : 'Create Party'}
        </Text>
      </Pressable>
    </View>
  );
}
