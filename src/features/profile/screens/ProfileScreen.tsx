import * as ImagePicker from 'expo-image-picker';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { updateUserProfile } from '../../../lib/supabase/queries/users';
import { useDialog } from '../../../providers/DialogProvider';
import {
  Button,
  DataFallbackScreen,
  Divider,
  LoadingScreen,
  TextField,
} from '../../../components';
import { signOut } from '../../../lib/supabase/queries/auth';
import { avatars as avatarsStorage } from '../../../lib/supabase/storage/avatars';
import { Ionicons } from '@expo/vector-icons';
import { useProfile } from '../hooks/useProfile';
import { useInvalidate } from '../../../lib/supabase/hooks/useInvalidate';
import { useAuth } from '../../../providers/AuthProvider';
import { compressImage } from '../../../lib/media/compress';
import { isValidUsername, normalize } from '../../../lib/utils/validation';
import { logger } from '../../../lib/telemetry/logger';
import { getErrorMessage } from '../../../lib/utils/errorExtraction';

export default function ProfileScreen() {
  const { userId } = useAuth();
  const dialog = useDialog();
  const invalidate = useInvalidate();

  const {
    profile,
    loading: profileLoading,
    error: profileError,
    refetch: refetchProfile,
  } = useProfile(userId);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      return () => {
        setEditing(false);
        setImageUri(null);
      };
    }, []),
  );

  useEffect(() => {
    if (!editing) return;
    ImagePicker.requestMediaLibraryPermissionsAsync();
    ImagePicker.requestCameraPermissionsAsync();
  }, [editing]);

  if (profileLoading) return <LoadingScreen label="Loading..." />;
  if (profileError || !profile)
    return <DataFallbackScreen onAction={refetchProfile} />;

  const editModeAvatarUri = imageUri || profile.avatarUrl;

  const handleEdit = () => {
    setEditing(true);
    setName(profile.name || '');
    setUsername(profile.username || '');
    setImageUri(null);
  };

  const handleCancel = () => {
    setEditing(false);
    setName(profile.name || '');
    setUsername(profile.username || '');
    setImageUri(null);
  };

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
    if (!isValidUsername(username)) {
      await dialog.error(
        'Invalid username',
        'Username must be 4-12 characters, lowercase letters, numbers, and underscores only',
      );
      return;
    }

    setLoading(true);
    try {
      const hasProfileChanges =
        name.trim() !== profile.name ||
        normalizedUsername !== profile.username ||
        imageUri !== null;
      if (!hasProfileChanges) return;

      let avatarPath = profile.avatar_path;
      if (imageUri) {
        const compressed = await compressImage(imageUri, 512, 0.6);
        const newPath = await avatarsStorage.upload(userId, compressed.uri);
        const oldPath = avatarPath;
        avatarPath = newPath;
        if (oldPath) await avatarsStorage.remove([oldPath]);
      }

      await updateUserProfile(userId, {
        name: name.trim(),
        username: normalizedUsername || null,
        avatar_path: avatarPath,
      });

      invalidate.profile();
      setEditing(false);
      setImageUri(null);
    } catch (err) {
      logger.error('Error updating user profile', { err });
      await dialog.error('Failed to Update Profile', getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    const confirmed = await dialog.confirmAsk(
      'Sign Out',
      'Are you sure you want to sign out?',
    );
    if (confirmed) {
      try {
        await signOut();
      } catch (err) {
        logger.error('Error signing out', { err });
        await dialog.error('Failed to Sign Out', getErrorMessage(err));
      }
    }
  };

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
                  onPress={handleChoosePhoto}
                  className="relative h-28 w-28 overflow-hidden rounded-full"
                >
                  {editModeAvatarUri ? (
                    <Image
                      source={{ uri: editModeAvatarUri }}
                      style={{ width: 112, height: 112 }}
                      cachePolicy="memory-disk"
                      contentFit="cover"
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
                      style={{ width: 96, height: 96, borderRadius: 48 }}
                      cachePolicy="memory-disk"
                      contentFit="cover"
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
