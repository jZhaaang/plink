import { useState } from 'react';
import { Text, View, Pressable, FlatList } from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { Modal, Spinner } from '../../../components';
import { useDialog } from '../../../providers/DialogProvider';
import { usePartyDetailList } from '../../parties/hooks/usePartyDetailList';
import { useActiveLinkContext } from '../../../providers/ActiveLinkProvider';
import { createLink } from '../../../lib/supabase/queries/links';
import CreateLinkModal from '../components/CreateLinkModal';
import { PartyDetail } from '../../../lib/models';
import { SignedInParamList } from '../../../navigation/types';
import { getErrorMessage } from '../../../lib/utils/errorExtraction';
import { useInvalidate } from '../../../lib/supabase/hooks/useInvalidate';
import { useAuth } from '../../../providers/AuthProvider';
import * as Burnt from 'burnt';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { Image } from 'expo-image';

export default function CreateLinkFlowScreen() {
  const { userId } = useAuth();
  const dialog = useDialog();
  const navigation = useNavigation<NavigationProp<SignedInParamList>>();
  const { theme } = useUnistyles();

  const invalidate = useInvalidate();
  const { createLinkVisible, closeCreateLink } = useActiveLinkContext();
  const { partyDetails, loading: partiesLoading } = usePartyDetailList(
    userId ?? null,
  );

  const [selectedParty, setSelectedParty] = useState<PartyDetail | null>(null);
  const [createLoading, setCreateLoading] = useState(false);

  const handleClose = () => {
    setSelectedParty(null);
    closeCreateLink();
  };

  const handleSubmit = async (name: string) => {
    if (!userId || !selectedParty) return;

    setCreateLoading(true);
    try {
      const link = await createLink({
        name,
        party_id: selectedParty.id,
        owner_id: userId,
      });

      if (link) {
        handleClose();
        invalidate.homeActiveLinks();
        invalidate.activeLink();
        invalidate.partyDetail(selectedParty.id);
        invalidate.parties();
        invalidate.activity();
        Burnt.toast({
          title: 'Link started!',
          preset: 'done',
          haptic: 'success',
        });
        navigation.navigate('App', {
          screen: 'Link',
          params: {
            screen: 'LinkDetail',
            params: { linkId: link.id, partyId: selectedParty.id },
          },
        });
      }
    } catch (err) {
      await dialog.error('Error creating link', getErrorMessage(err));
    } finally {
      setCreateLoading(false);
    }
  };

  if (selectedParty) {
    return (
      <CreateLinkModal
        visible={createLinkVisible}
        loading={createLoading}
        onClose={handleClose}
        onSubmit={handleSubmit}
      />
    );
  }

  return (
    <Modal
      visible={createLinkVisible}
      onClose={handleClose}
      animationType="fade"
    >
      <View style={styles.header}>
        <Text style={styles.title}>Start a Link</Text>
        <Pressable onPress={handleClose}>
          <View style={styles.closeButton}>
            <Text style={styles.closeText}>Close</Text>
          </View>
        </Pressable>
      </View>

      <Text style={styles.subtitle}>
        Which party do you want to start a link in?
      </Text>

      {partiesLoading ? (
        <Spinner />
      ) : partyDetails.length === 0 ? (
        <Text style={styles.emptyText}>You are not in any parties yet.</Text>
      ) : (
        <FlatList
          data={partyDetails}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <Pressable onPress={() => setSelectedParty(item)}>
              <View style={styles.partyRow}>
                {item.avatarUrl ? (
                  <Image
                    source={{ uri: item.avatarUrl }}
                    style={styles.partyAvatar}
                    cachePolicy="memory-disk"
                    contentFit="cover"
                  />
                ) : (
                  <View style={styles.partyAvatar}>
                    <MaterialIcons
                      name="group"
                      size={16}
                      color={theme.colors.gray}
                    />
                  </View>
                )}
                <View style={styles.partyInfo}>
                  <Text style={styles.partyName}>{item.name}</Text>
                  <Text style={styles.partyMeta}>
                    {item.members.length}{' '}
                    {item.members.length === 1 ? 'member' : 'members'}
                  </Text>
                </View>
                <Feather name="chevron-right" size={18} color="#94a3b8" />
              </View>
            </Pressable>
          )}
        />
      )}
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
  subtitle: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textTertiary,
    marginBottom: theme.spacing.lg,
  },
  emptyText: {
    textAlign: 'center',
    color: theme.colors.textPlaceholder,
    marginVertical: theme.spacing['3xl'],
  },
  partyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.radii.lg,
  },
  partyAvatar: {
    width: 40,
    height: 40,
    borderRadius: theme.radii.full,
    backgroundColor: theme.colors.accentSurfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  partyInfo: {
    flex: 1,
  },
  partyName: {
    fontWeight: theme.fontWeights.medium,
    color: theme.colors.textPrimary,
  },
  partyMeta: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textPlaceholder,
  },
}));
