import * as ImagePicker from 'expo-image-picker';
import { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Button, TextField } from '../../../components';
import { avatars } from '../../../lib/supabase/storage/avatars';
import { RootStackParamList } from '../../../navigation/types';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { updateUserProfile } from '../../../lib/supabase/queries/users';
import { useDialog } from '../../../providers/DialogProvider';
import { useAuth } from '../../../lib/supabase/hooks/useAuth';

type Props = NativeStackScreenProps<RootStackParamList, 'SignedIn'>;

export default function CompleteProfileScreen({ navigation }: Props) {
  const { session, ready } = useAuth();
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const dialog = useDialog();

  useEffect(() => {
    ImagePicker.requestMediaLibraryPermissionsAsync();
    ImagePicker.requestCameraPermissionsAsync();
  }, []);

  async function choosePhoto() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [3, 3],
      quality: 1,
    });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  }

  async function takePhoto() {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [3, 3],
      quality: 1,
    });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  }

  function removePhoto() {
    setImageUri(null);
  }

  async function save() {
    if (!session?.user) {
      await dialog.error('Session Error', 'Please sign in again');
      return;
    }

    if (!name.trim()) {
      await dialog.error('Missing info', 'Name cannot be empty');
      return;
    }

    const trimmedUsername = username.trim().toLowerCase();
    if (!trimmedUsername) {
      await dialog.error('Missing info', 'Username is required');
      return;
    }

    if (!/^[a-z0-9_]{3,12}$/.test(trimmedUsername)) {
      await dialog.error(
        'Invalid username',
        'Username must be 3-12 characters: lowercase letters, numbers, and underscores',
      );
      return;
    }

    setLoading(true);
    try {
      let avatarId = null;

      if (imageUri) {
        avatarId = await avatars.upload(session.user.id, imageUri, 'jpg');
      } else {
        const encodedName = encodeURIComponent(name.trim());
        avatarId = await avatars.upload(
          session.user.id,
          `https://ui-avatars.com/api/?name=${encodedName}&background=random&rounded=true&length=1&format=jpg`,
        );
      }

      await updateUserProfile(session.user.id, {
        name: name.trim(),
        username: trimmedUsername,
        avatar_id: avatarId,
      });
      navigation.replace('SignedIn', { needsProfile: false });
    } catch (err) {
      if (err.message?.includes('duplicate') || err.code == '23505') {
        await dialog.error(
          'Username taken',
          'This username is already in use. Please choose another',
        );
      } else {
        await dialog.error('Save Error', err.message);
      }
    } finally {
      setLoading(false);
    }
  }

  if (!ready || !session?.user) return null;

  return (
    <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-white">
      <View className="flex-1 gap-8 px-6">
        <View className="pt-2">
          <Text className="text-2xl font-extrabold tracking-tight text-slate-900">
            plink
          </Text>
        </View>

        <View className="gap-2">
          <Text className="text-3xl font-bold text-slate-900">
            Complete your profile
          </Text>
          <Text className="text-slate-600">Add a name and a photo</Text>
        </View>

        <View className="items-center gap-3">
          <Pressable
            onPress={choosePhoto}
            className="h-28 w-28 items-center justify-center overflow-hidden rounded-full bg-slate-200"
          >
            {imageUri ? (
              <Image source={{ uri: imageUri }} className="h-28 w-28" />
            ) : (
              <Ionicons name="camera-outline" size={26} color="#64748b" />
            )}
          </Pressable>

          <View className="flex-row gap-3">
            <Button
              title="Choose photo"
              variant="outline"
              size="sm"
              onPress={choosePhoto}
              textClassName="text-sm font-normal text-slate-600"
            />
            <Button
              title="Take photo"
              variant="outline"
              size="sm"
              onPress={takePhoto}
              textClassName="text-sm font-normal text-slate-600"
            />
            <Button
              title="Remove photo"
              variant="outline"
              size="sm"
              onPress={removePhoto}
              textClassName="text-sm font-normal text-slate-600"
            />
          </View>
        </View>

        <View className="gap-1">
          <TextField
            header="Name"
            left={<Ionicons name="person-outline" size={18} color="#64748b" />}
            placeholder="Your name"
            value={name}
            onChangeText={setName}
            returnKeyType="done"
            onSubmitEditing={save}
          />
          <TextField
            header="Username"
            left={<Text className="text-slate-400 text-base">@</Text>}
            placeholder="username"
            value={username}
            onChangeText={(text) =>
              setUsername(text.toLowerCase().replace(/[^a-z0-9_]/g, ''))
            }
            autoCapitalize="none"
            autoCorrect={false}
            maxLength={12}
            returnKeyType="done"
            onSubmitEditing={save}
          />
          <Text className="pl-1 text-[11px] text-slate-500">
            3-12 characters. Others will find you by this.
          </Text>
        </View>

        <Button
          title="Save"
          size="lg"
          disabled={loading || !name.trim() || !username.trim()}
          onPress={save}
        />
      </View>
    </SafeAreaView>
  );
}
