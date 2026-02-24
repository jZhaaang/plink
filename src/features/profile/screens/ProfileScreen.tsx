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
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import * as Burnt from 'burnt';
import { deletePushToken } from '../../../lib/supabase/queries/pushTokens';
import { StyleSheet } from 'react-native-unistyles';

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
      Burnt.toast({
        title: 'Photo access needed to change avatar',
        preset: 'error',
        haptic: 'error',
      });
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
      Burnt.toast({
        title: 'Profile saved',
        preset: 'done',
        haptic: 'success',
      });
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
        try {
          const projectId =
            Constants.expoConfig?.extra?.eas?.projectId ??
            Constants.easConfig?.projectId;

          if (projectId) {
            const token = (
              await Notifications.getExpoPushTokenAsync({ projectId })
            ).data;
            await deletePushToken(token);
          }
        } catch (err) {
          logger.error('Error removing push token on sign out', { err });
        }

        await signOut();
      } catch (err) {
        logger.error('Error signing out', { err });
        await dialog.error('Failed to Sign Out', getErrorMessage(err));
      }
    }
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {editing ? (
          <>
            <Text style={styles.screenTitle}>Edit Profile</Text>
            <Divider />

            <View style={styles.sectionGroup}>
              {/* Avatar Editor */}
              <View style={styles.avatarSection}>
                <Pressable onPress={handleChoosePhoto}>
                  <View style={styles.avatarEditWrap}>
                    {editModeAvatarUri ? (
                      <Image
                        source={{ uri: editModeAvatarUri }}
                        style={{ width: 112, height: 112 }}
                        cachePolicy="memory-disk"
                        contentFit="cover"
                      />
                    ) : null}
                    <View style={styles.avatarOverlay}>
                      <Ionicons name="camera-outline" size={32} color="white" />
                    </View>
                  </View>
                </Pressable>
                <Text style={styles.avatarHint}>Tap to change photo</Text>
              </View>

              {/* Name Field */}
              <View style={styles.fieldGroup}>
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
              <View style={styles.fieldGroup}>
                <TextField
                  header="Username"
                  left={<Text style={styles.atSymbol}>@</Text>}
                  placeholder="username"
                  value={username}
                  onChangeText={(text) =>
                    setUsername(text.toLowerCase().replace(/[^a-z0-9_]/g, ''))
                  }
                  autoCapitalize="none"
                  autoCorrect={false}
                  maxLength={20}
                />
                <Text style={styles.fieldHint}>
                  Others can find and invite you by username
                </Text>
              </View>

              {/* Action Buttons */}
              <View style={styles.actionGroup}>
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
            <Text style={styles.screenTitle}>My Profile</Text>
            <Divider />

            <View style={styles.sectionGroup}>
              {/* Profile Display Card */}
              <View style={styles.profileCard}>
                <View style={styles.profileAvatarWrap}>
                  {profile.avatarUrl ? (
                    <Image
                      source={{ uri: profile.avatarUrl }}
                      style={{ width: 96, height: 96, borderRadius: 48 }}
                      cachePolicy="memory-disk"
                      contentFit="cover"
                    />
                  ) : null}
                </View>

                <Text style={styles.profileName}>{profile.name}</Text>

                {profile.username && (
                  <Text style={styles.profileUsername}>
                    @{profile.username}
                  </Text>
                )}

                <Text style={styles.profileJoinDate}>
                  Joined {new Date(profile.created_at).toLocaleDateString()}
                </Text>
              </View>

              <Button
                title="Edit Profile"
                variant="outline"
                onPress={handleEdit}
              />

              <View style={styles.signOutWrap}>
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

const styles = StyleSheet.create((theme) => ({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
  },
  screenTitle: {
    fontSize: theme.fontSizes.xl,
    fontWeight: theme.fontWeights.bold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.lg,
  },
  sectionGroup: {
    gap: theme.spacing['2xl'],
    marginTop: theme.spacing.lg,
  },
  avatarSection: {
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  avatarEditWrap: {
    height: 112,
    width: 112,
    overflow: 'hidden',
    borderRadius: theme.radii.full,
  },
  avatarOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.overlayMedium,
  },
  avatarHint: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textTertiary,
  },
  fieldGroup: {
    gap: theme.spacing.xs,
  },
  atSymbol: {
    color: theme.colors.textPlaceholder,
  },
  fieldHint: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textTertiary,
    paddingHorizontal: theme.spacing.xs,
  },
  actionGroup: {
    gap: theme.spacing.md,
  },
  profileCard: {
    alignItems: 'center',
    borderRadius: theme.radii.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing['2xl'],
    ...theme.shadows.md,
  },
  profileAvatarWrap: {
    marginBottom: theme.spacing.lg,
  },
  profileName: {
    fontSize: theme.fontSizes.xl,
    fontWeight: theme.fontWeights.semibold,
    color: theme.colors.textPrimary,
  },
  profileUsername: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textTertiary,
  },
  profileJoinDate: {
    marginTop: theme.spacing.xs,
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textTertiary,
  },
  signOutWrap: {
    marginTop: theme.spacing['2xl'],
  },
}));
