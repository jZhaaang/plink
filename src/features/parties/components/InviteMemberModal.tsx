import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Feather } from '@expo/vector-icons';
import * as Burnt from 'burnt';
import { Button, Modal, Spinner, TextField } from '../../../components';
import { useInviteMember } from '../hooks/useInviteMember';
import { resolveProfile } from '../../../lib/resolvers/profile';
import { StyleSheet } from 'react-native-unistyles';

interface Props {
  visible: boolean;
  onClose: () => void;
  partyId: string;
  existingMemberIds: string[];
  onSuccess: () => void;
}

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
      Burnt.toast({ title: `@${state.user.username} invited`, preset: 'done', haptic: 'success' });
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
          <Text style={styles.errorText}>
            No user found with that username
          </Text>
        );
      case 'already_member':
        return (
          <Text style={styles.warningText}>
            This user is already a member
          </Text>
        );
      case 'error':
        return (
          <Text style={styles.errorText}>{state.message}</Text>
        );
      default:
        return null;
    }
  };

  return (
    <Modal visible={visible} onClose={handleClose} animationType="slide">
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Invite Member</Text>
        <Pressable onPress={handleClose}>
          <View style={styles.closeButton}>
            <Text style={styles.closeText}>Close</Text>
          </View>
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
        left={<Text style={styles.atSymbol}>@</Text>}
      />

      {/* Status Messages */}
      {renderStatusMessage()}

      {/* Search Result - User Preview Card */}
      {state.status === 'searching' && (
        <View style={styles.spinnerWrap}>
          <Spinner />
        </View>
      )}

      {state.status === 'found' && (
        <View style={styles.userCard}>
          <Image
            source={{ uri: foundUserAvatarUrl ?? undefined }}
            cachePolicy="memory-disk"
            style={{ width: 44, height: 44, borderRadius: 22 }}
          />
          <View style={styles.userInfo}>
            <Text style={styles.userName}>
              {state.user.name || 'Unknown'}
            </Text>
            <Text style={styles.userHandle}>
              @{state.user.username}
            </Text>
          </View>
          <Feather name="check-circle" size={20} color="#22c55e" />
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actions}>
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

const styles = StyleSheet.create((theme) => ({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: theme.fontSizes.lg,
    fontWeight: theme.fontWeights.semibold,
    color: theme.colors.textPrimary,
  },
  closeButton: {
    padding: theme.spacing.sm,
  },
  closeText: {
    color: theme.colors.textTertiary,
  },
  atSymbol: {
    color: theme.colors.textPlaceholder,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: theme.fontSizes.sm,
    marginTop: theme.spacing.sm,
  },
  warningText: {
    color: theme.colors.warning,
    fontSize: theme.fontSizes.sm,
    marginTop: theme.spacing.sm,
  },
  spinnerWrap: {
    marginTop: theme.spacing.lg,
    padding: theme.spacing.lg,
    alignItems: 'center',
  },
  userCard: {
    marginTop: theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surfacePressed,
    borderRadius: theme.radii.lg,
  },
  userInfo: {
    marginLeft: theme.spacing.md,
    flex: 1,
  },
  userName: {
    fontSize: theme.fontSizes.base,
    fontWeight: theme.fontWeights.medium,
    color: theme.colors.textPrimary,
  },
  userHandle: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textTertiary,
  },
  actions: {
    marginTop: theme.spacing['2xl'],
    gap: theme.spacing.md,
  },
}));
