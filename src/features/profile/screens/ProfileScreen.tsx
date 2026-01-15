import { View, Text, ActivityIndicator, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../../lib/supabase/hooks/useAuth';
import { ProfileResolved } from '../../../lib/models';
import { useEffect, useState } from 'react';
import { getUserProfile } from '../../../lib/supabase/queries/users';
import { toProfileResolved } from '../../../lib/resolvers/profile';
import { useDialog } from '../../../providers/DialogProvider';
import { Button } from '../../../components';
import { signOut } from '../../../lib/supabase/queries/auth';

export default function ProfileScreen() {
  const { session } = useAuth();
  const dialog = useDialog();

  const [profile, setProfile] = useState<ProfileResolved | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, [session]);

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
        setProfile(resolved);
      }
    } catch (err) {
      await dialog.error('Error loading profile:', err);
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

  return (
    <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-neutral-50">
      <ScrollView className="flex-1" contentContainerClassName="px-6 py-4">
        <View className="gap-6">
          <Text className="text-2xl font-bold text-slate-900">My Profile</Text>

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
          <Button title="Edit Profile" variant="outline" onPress={() => {}} />

          {/* Sign Out Button */}
          <View className="mt-6">
            <Button title="Sign Out" variant="ghost" onPress={handleSignOut} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
