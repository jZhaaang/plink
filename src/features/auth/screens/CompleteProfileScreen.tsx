import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Button, LoadingScreen, TextField } from '../../../components';
import { avatars as avatarsStorage } from '../../../lib/supabase/storage/avatars';
import { RootStackParamList } from '../../../navigation/types';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { updateUserProfile } from '../../../lib/supabase/queries/users';
import { useDialog } from '../../../providers/DialogProvider';
import { useAuth } from '../../../providers/AuthProvider';
import { trackEvent } from '../../../lib/telemetry/analytics';
import { compressImage } from '../../../lib/media/compress';
import { isValidUsername, normalize } from '../../../lib/utils/validation';
import { logger } from '../../../lib/telemetry/logger';
import { getErrorMessage } from '../../../lib/utils/errorExtraction';

type Props = NativeStackScreenProps<RootStackParamList, 'SignedIn'>;

export default function CompleteProfileScreen({ navigation }: Props) {
  const { userId, ready } = useAuth();
  const dialog = useDialog();

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);

  const handleChoosePhoto = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      await dialog.error(
        'Permission needed',
        'Allow photo access to choose an avatar.',
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [3, 3],
    });

    if (!result.canceled) setImageUri(result.assets[0].uri);
  };

  const handleTakePhoto = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      await dialog.error(
        'Permission needed',
        'Allow camera access to choose an avatar.',
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [3, 3],
    });

    if (!result.canceled) setImageUri(result.assets[0].uri);
  };

  const handleSave = async () => {
    if (!userId) {
      await dialog.error('Session Error', 'Please sign in again');
      return;
    }

    if (!name.trim()) {
      await dialog.error('Missing info', 'Name cannot be empty');
      return;
    }

    const normalizedUsername = normalize(username);
    if (!normalizedUsername) {
      await dialog.error('Missing info', 'Username is required');
      return;
    }

    if (!isValidUsername(username)) {
      await dialog.error(
        'Invalid username',
        'Username must be 4-12 characters: lowercase letters, numbers, and underscores',
      );
      return;
    }

    setLoading(true);
    try {
      let avatarPath = null;

      if (imageUri) {
        const compressed = await compressImage(imageUri, 512, 0.6);
        avatarPath = await avatarsStorage.upload(userId, compressed.uri);
      } else {
        const encodedName = encodeURIComponent(name.trim());
        avatarPath = await avatarsStorage.upload(
          userId,
          `https://ui-avatars.com/api/?name=${encodedName}&background=random&rounded=true&length=1&format=jpg&size=128`,
        );
      }

      await updateUserProfile(userId, {
        name: name.trim(),
        username: normalizedUsername,
        avatar_path: avatarPath,
      });
      trackEvent('profile_completed');
      navigation.replace('SignedIn', { needsProfile: false });
    } catch (err) {
      logger.error('Error updating user profile:', { err });
      await dialog.error('Failed to Save Profile', getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (!ready) return <LoadingScreen label="Loading..." />;

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
            onPress={handleChoosePhoto}
            className="h-28 w-28 items-center justify-center overflow-hidden rounded-full bg-slate-200"
          >
            {imageUri ? (
              <Image
                source={{ uri: imageUri }}
                cachePolicy="memory-disk"
                className="h-28 w-28"
              />
            ) : (
              <Ionicons name="camera-outline" size={26} color="#64748b" />
            )}
          </Pressable>

          <View className="flex-row gap-3">
            <Button
              title="Choose photo"
              variant="outline"
              size="sm"
              onPress={handleChoosePhoto}
              textClassName="text-sm font-normal text-slate-600"
            />
            <Button
              title="Take photo"
              variant="outline"
              size="sm"
              onPress={handleTakePhoto}
              textClassName="text-sm font-normal text-slate-600"
            />
            <Button
              title="Remove photo"
              variant="outline"
              size="sm"
              onPress={() => setImageUri(null)}
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
            onSubmitEditing={handleSave}
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
            onSubmitEditing={handleSave}
          />
          <Text className="pl-1 text-[11px] text-slate-500">
            4-12 characters. Others will find you by this.
          </Text>
        </View>

        <Button
          title="Save"
          size="lg"
          disabled={loading || !name.trim() || !username.trim()}
          onPress={handleSave}
        />
      </View>
    </SafeAreaView>
  );
}
