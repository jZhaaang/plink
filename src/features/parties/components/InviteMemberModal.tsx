import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Feather } from '@expo/vector-icons';
import { Button, Modal, Spinner, TextField } from '../../../components';
import { useInviteMember } from '../hooks/useInviteMember';
import { resolveProfile } from '../../../lib/resolvers/profile';

type Props = {
  visible: boolean;
  onClose: () => void;
  partyId: string;
  existingMemberIds: string[];
  onSuccess: () => void;
};

export default function InviteMemberModal({
  visible,
  onClose,
  partyId,
  existingMemberIds,
  onSuccess,
}: Props) {
  const [username, setUsername] = useState('');
  const [foundUserAvatarUrl, setFoundUserAvatarUrl] = useState<string | null>(
    null,
  );
  const { state, searchUser, inviteUser, reset } = useInviteMember(
    partyId,
    existingMemberIds,
  );

  useEffect(() => {
    if (!visible) {
      setUsername('');
      reset();
    }
  }, [visible, reset]);

  useEffect(() => {
    if (state.status !== 'found') {
      setFoundUserAvatarUrl(null);
      return;
    }

    let cancelled = false;
    resolveProfile(state.user).then((profile) => {
      if (!cancelled) setFoundUserAvatarUrl(profile.avatarUrl);
    });
    return () => {
      cancelled = true;
    };
  }, [state.status === 'found' ? state.user.id : null]);

  const handleSearch = () => {
    const trimmed = username.trim();
    if (trimmed) {
      searchUser(trimmed);
    }
  };

  const handleInvite = async () => {
    if (state.status === 'found') {
      await inviteUser(state.user.id);
      onSuccess();
      onClose();
    }
  };

  const handleClose = () => {
    onClose();
  };

  const renderStatusMessage = () => {
    switch (state.status) {
      case 'not_found':
        return (
          <Text className="text-red-500 text-sm mt-2">
            No user found with that username
          </Text>
        );
      case 'already_member':
        return (
          <Text className="text-amber-600 text-sm mt-2">
            This user is already a member
          </Text>
        );
      case 'error':
        return (
          <Text className="text-red-500 text-sm mt-2">{state.message}</Text>
        );
      default:
        return null;
    }
  };

  return (
    <Modal visible={visible} onClose={handleClose} animationType="slide">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-lg font-semibold">Invite Member</Text>
        <Pressable onPress={handleClose} className="p-2">
          <Text className="text-neutral-500">Close</Text>
        </Pressable>
      </View>

      {/* Search Input */}
      <TextField
        header="Username"
        value={username}
        onChangeText={setUsername}
        placeholder="Enter username"
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
        onSubmitEditing={handleSearch}
        left={<Text className="text-slate-400">@</Text>}
      />

      {/* Status Messages */}
      {renderStatusMessage()}

      {/* Search Result - User Preview Card */}
      {state.status === 'searching' && (
        <View className="mt-4 p-4 items-center">
          <Spinner />
        </View>
      )}

      {state.status === 'found' && (
        <View className="mt-4 flex-row items-center p-3 bg-slate-100 rounded-xl">
          <Image
            source={{ uri: foundUserAvatarUrl ?? undefined }}
            cachePolicy="memory-disk"
            style={{ width: 44, height: 44, borderRadius: 22 }}
          />
          <View className="ml-3 flex-1">
            <Text className="text-base font-medium text-slate-900">
              {state.user.name || 'Unknown'}
            </Text>
            <Text className="text-sm text-slate-500">
              @{state.user.username}
            </Text>
          </View>
          <Feather name="check-circle" size={20} color="#22c55e" />
        </View>
      )}

      {/* Action Buttons */}
      <View className="mt-6 gap-3">
        {state.status === 'found' || state.status === 'inviting' ? (
          <Button
            title="Invite"
            size="lg"
            onPress={handleInvite}
            loading={state.status === 'inviting'}
          />
        ) : (
          <Button
            title="Search"
            size="lg"
            onPress={handleSearch}
            loading={state.status === 'searching'}
            disabled={!username.trim()}
          />
        )}
      </View>
    </Modal>
  );
}
