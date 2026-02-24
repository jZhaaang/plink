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
import * as Burnt from 'burnt';
import { StyleSheet } from 'react-native-unistyles';

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
      Burnt.toast({
        title: 'Photo access required',
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

  const handleTakePhoto = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Burnt.toast({
        title: 'Camera access required',
        preset: 'error',
        haptic: 'error',
      });
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
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.logoWrap}>
          <Text style={styles.logo}>plink</Text>
        </View>

        <View style={styles.headingGroup}>
          <Text style={styles.heading}>Complete your profile</Text>
          <Text style={styles.subheading}>Add a name and a photo</Text>
        </View>

        <View style={styles.avatarSection}>
          <Pressable onPress={handleChoosePhoto}>
            <View style={styles.avatarCircle}>
              {imageUri ? (
                <Image
                  source={{ uri: imageUri }}
                  cachePolicy="memory-disk"
                  contentFit="cover"
                  style={{ width: 112, height: 112 }}
                />
              ) : (
                <Ionicons name="camera-outline" size={26} color="#64748b" />
              )}
            </View>
          </Pressable>

          <View style={styles.avatarActions}>
            <Button
              title="Choose photo"
              variant="outline"
              size="sm"
              onPress={handleChoosePhoto}
            />
            <Button
              title="Take photo"
              variant="outline"
              size="sm"
              onPress={handleTakePhoto}
            />
            <Button
              title="Remove photo"
              variant="outline"
              size="sm"
              onPress={() => setImageUri(null)}
            />
          </View>
        </View>

        <View style={styles.fieldGroup}>
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
            left={<Text style={styles.atSymbol}>@</Text>}
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
          <Text style={styles.hint}>
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

const styles = StyleSheet.create((theme) => ({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  container: {
    flex: 1,
    gap: theme.spacing['3xl'],
    paddingHorizontal: theme.spacing['2xl'],
  },
  logoWrap: {
    paddingTop: theme.spacing.sm,
  },
  logo: {
    fontSize: theme.fontSizes['2xl'],
    fontWeight: theme.fontWeights.extrabold,
    letterSpacing: -0.6,
    color: theme.colors.textPrimary,
  },
  headingGroup: {
    gap: theme.spacing.sm,
  },
  heading: {
    fontSize: theme.fontSizes['3xl'],
    fontWeight: theme.fontWeights.bold,
    color: theme.colors.textPrimary,
  },
  subheading: {
    color: theme.colors.iconSecondary,
  },
  avatarSection: {
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  avatarCircle: {
    height: 112,
    width: 112,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: theme.radii.full,
    backgroundColor: theme.colors.border,
  },
  avatarActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  fieldGroup: {
    gap: theme.spacing.xs,
  },
  atSymbol: {
    color: theme.colors.textPlaceholder,
    fontSize: theme.fontSizes.base,
  },
  hint: {
    paddingLeft: theme.spacing.xs,
    fontSize: 11,
    color: theme.colors.textTertiary,
  },
}));
