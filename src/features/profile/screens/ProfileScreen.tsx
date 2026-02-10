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
import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  updateUserProfile,
  searchUserByUsername,
} from '../../../lib/supabase/queries/users';
import { useDialog } from '../../../providers/DialogProvider';
import { Button, Divider, TextField } from '../../../components';
import { signOut } from '../../../lib/supabase/queries/auth';
import { avatars } from '../../../lib/supabase/storage/avatars';
import { Ionicons } from '@expo/vector-icons';
import { useProfile } from '../../../lib/supabase/hooks/useProfile';

export default function ProfileScreen() {
  const { session } = useAuth();
  const userId = session?.user?.id ?? null;
  const dialog = useDialog();

  const {
    profile,
    loading: profileLoading,
    refetch: reloadProfile,
  } = useProfile(userId);
  const [saving, setSaving] = useState(false);

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);

  useEffect(() => {
    reloadProfile();
  }, [session]);

  useFocusEffect(
    useCallback(() => {
      return () => {
        setEditing(false);
        setImageUri(null);
      };
    }, []),
  );

  useEffect(() => {
    ImagePicker.requestMediaLibraryPermissionsAsync();
    ImagePicker.requestCameraPermissionsAsync();
  }, [editing]);

  function handleEdit() {
    setEditing(true);
    setName(profile.name || '');
    setUsername(profile.username || '');
    setImageUri(null);
  }

  function handleCancel() {
    setEditing(false);
    setName(profile.name || '');
    setUsername(profile.username || '');
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

    const trimmedUsername = username.trim().toLowerCase();
    if (trimmedUsername && !/^[a-z0-9_]{3,12}$/.test(trimmedUsername)) {
      await dialog.error(
        'Invalid username',
        'Username must be 3-12 characters, lowercase letters, numbers, and underscores only',
      );
      return;
    }

    try {
      if (trimmedUsername && trimmedUsername !== profile.username) {
        const existingUser = await searchUserByUsername(trimmedUsername);
        if (existingUser && existingUser.id !== session.user.id) {
          await dialog.error(
            'Username taken',
            'This username is already in use',
          );
          return;
        }
      }
      setSaving(true);

      let avatarPath = profile.avatar_path;

      if (imageUri) {
        const newPath = await avatars.upload(session.user.id, imageUri);
        const oldPath = avatarPath;
        avatarPath = newPath;
        if (oldPath) await avatars.remove([oldPath]);
      }

      await updateUserProfile(session.user.id, {
        name: name.trim(),
        username: trimmedUsername || null,
        avatar_path: avatarPath,
      });

      await reloadProfile();
      setEditing(false);
      setImageUri(null);
    } catch (err) {
      if (err.message?.includes('duplicate') || err.code == '23505') {
        await dialog.error('Username taken', 'This username is already in use');
      } else {
        await dialog.error('Save Error', err.message);
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleSignOut() {
    const confirmed = await dialog.confirmAsk(
      'Sign Out',
      'Are you sure you want to sign out?',
    );
    if (confirmed) await signOut();
  }

  if (profileLoading) {
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
      <ScrollView className="flex-1" contentContainerClassName="px-4">
        {editing ? (
          <>
            <Text className="text-xl font-bold mb-4">Edit Profile</Text>
            <Divider />

            <View className="gap-6 mt-4">
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

              {/* Username Field */}
              <View className="gap-1">
                <TextField
                  header="Username"
                  left={<Text className="text-slate-400">@</Text>}
                  placeholder="username"
                  value={username}
                  onChangeText={(text) =>
                    setUsername(text.toLowerCase().replace(/[^a-z0-9_]/g, ''))
                  }
                  autoCapitalize="none"
                  autoCorrect={false}
                  maxLength={20}
                />
                <Text className="text-xs text-slate-500 px-1">
                  Others can find and invite you by username
                </Text>
              </View>

              {/* Action Buttons */}
              <View className="gap-3">
                <Button
                  title="Save"
                  onPress={handleSave}
                  disabled={saving || !name.trim()}
                />
                <Button
                  title="Cancel"
                  variant="outline"
                  onPress={handleCancel}
                  disabled={saving}
                />
              </View>
            </View>
          </>
        ) : (
          <>
            <Text className="text-xl font-bold mb-4">My Profile</Text>
            <Divider />

            <View className="gap-6 mt-4">
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

                {/* Username */}
                {profile.username && (
                  <Text className="text-sm text-slate-500">
                    @{profile.username}
                  </Text>
                )}

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
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
