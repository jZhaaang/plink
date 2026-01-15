import * as ImagePicker from 'expo-image-picker';
import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  Image,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../../lib/supabase/hooks/useAuth';
import { ProfileResolved } from '../../../lib/models';
import { useEffect, useState } from 'react';
import {
  getUserProfile,
  updateUserProfile,
} from '../../../lib/supabase/queries/users';
import { toProfileResolved } from '../../../lib/resolvers/profile';
import { useDialog } from '../../../providers/DialogProvider';
import { Button, TextField } from '../../../components';
import { signOut } from '../../../lib/supabase/queries/auth';
import { avatars } from '../../../lib/supabase/storage/avatars';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen() {
  const { session } = useAuth();
  const dialog = useDialog();

  const [profile, setProfile] = useState<ProfileResolved | null>(null);
  const [loading, setLoading] = useState(true);

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);

  useEffect(() => {
    loadProfile();
  }, [session]);

  useEffect(() => {
    ImagePicker.requestMediaLibraryPermissionsAsync();
    ImagePicker.requestCameraPermissionsAsync();
  }, [editing]);

  async function loadProfile() {
    if (!session?.user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const rawProfile = await getUserProfile(session.user.id);
      if (rawProfile) {
        const resolved = await toProfileResolved(rawProfile);
        console.log(resolved.avatarUrl);
        setProfile(resolved);
      }
    } catch (err) {
      await dialog.error('Error loading profile:', err);
    } finally {
      setLoading(false);
    }
  }

  function handleEdit() {
    setEditing(true);
    setName(profile.name || '');
    setImageUri(null);
  }

  function handleCancel() {
    setEditing(false);
    setName(profile.name || '');
    setImageUri(null);
  }

  async function choosePhoto() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [3, 3],
      quality: 1,
    });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  }

  async function handleSave() {
    if (!session?.user) {
      await dialog.error('Session Error', 'Please sign in again');
      return;
    }

    if (!name.trim()) {
      await dialog.error('Missing info', 'Name cannot be empty');
      return;
    }
    setLoading(true);
    try {
      if (imageUri) {
        await avatars.upload(session.user.id, imageUri, 'jpg');
      }

      await updateUserProfile(session.user.id, {
        name: name.trim(),
      });

      await loadProfile();
      setEditing(false);
      setImageUri(null);
    } catch (err) {
      await dialog.error('Save Error', err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSignOut() {
    const confirmed = await dialog.confirmAsk(
      'Sign Out',
      'Are you sure you want to sign out?',
    );
    if (confirmed) await signOut();
  }

  if (loading) {
    return (
      <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-neutral-50">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-neutral-50">
        <View className="flex-1 items-center justify-center">
          <Text className="text-slate-500">No profile found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const editModeAvatarUri = imageUri || profile.avatarUrl;

  return (
    <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-neutral-50">
      <ScrollView className="flex-1" contentContainerClassName="px-6 py-4">
        {editing ? (
          // EDIT MODE
          <View className="gap-6">
            <Text className="text-2xl font-bold text-slate-900">
              Edit Profile
            </Text>

            {/* Avatar Editor */}
            <View className="items-center gap-2">
              <Pressable
                onPress={choosePhoto}
                className="relative h-28 w-28 overflow-hidden rounded-full"
              >
                {editModeAvatarUri ? (
                  <Image
                    source={{ uri: editModeAvatarUri }}
                    className="h-28 w-28"
                  />
                ) : (
                  ''
                )}
                {/* Camera Icon Overlay */}
                <View className="absolute inset-0 items-center justify-center bg-black/30">
                  <Ionicons name="camera-outline" size={32} color="white" />
                </View>
              </Pressable>
              <Text className="text-sm text-slate-500">
                Tap to change photo
              </Text>
            </View>

            {/* Name Field */}
            <View className="gap-1">
              <TextField
                header="Name"
                left={
                  <Ionicons name="person-outline" size={18} color="#64748b" />
                }
                placeholder="Your name"
                value={name}
                onChangeText={setName}
                returnKeyType="done"
                onSubmitEditing={handleSave}
              />
            </View>

            {/* Action Buttons */}
            <View className="gap-3">
              <Button
                title="Save"
                onPress={handleSave}
                disabled={loading || !name.trim()}
              />
              <Button
                title="Cancel"
                variant="outline"
                onPress={handleCancel}
                disabled={loading}
              />
            </View>
          </View>
        ) : (
          // DISPLAY MODE
          <View className="gap-6">
            <Text className="text-2xl font-bold text-slate-900">
              My Profile
            </Text>

            {/* Profile Display Card */}
            <View className="items-center rounded-2xl border border-slate-200 bg-white p-6 shadow-md">
              {/* Avatar */}
              <View className="mb-4">
                {profile.avatarUrl ? (
                  <Image
                    source={{ uri: profile.avatarUrl }}
                    className="h-24 w-24 rounded-full"
                  />
                ) : (
                  ''
                )}
              </View>

              {/* Name */}
              <Text className="text-xl font-semibold text-slate-900">
                {profile.name}
              </Text>

              {/* Join Date */}
              <Text className="mt-1 text-sm text-slate-500">
                Joined {new Date(profile.created_at).toLocaleDateString()}
              </Text>
            </View>

            {/* Edit Profile Button */}
            <Button
              title="Edit Profile"
              variant="outline"
              onPress={handleEdit}
            />

            {/* Sign Out Button */}
            <View className="mt-6">
              <Button
                title="Sign Out"
                variant="ghost"
                onPress={handleSignOut}
              />
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
