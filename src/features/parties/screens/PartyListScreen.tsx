import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PartyStackParamList } from '../../../navigation/types';
import { parties as partiesStorage } from '../../../lib/media-service/parties';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FlatList, View, Text, Pressable } from 'react-native';
import PartyCard from '../components/PartyCard';
import {
  AnimatedListItem,
  Button,
  DataFallbackScreen,
  Divider,
  EmptyState,
  Spinner,
} from '../../../components';
import { useDialog } from '../../../providers/DialogProvider';
import { useState } from 'react';
import CreatePartyModal from '../components/CreatePartyModal';
import {
  createParty,
  updatePartyById,
} from '../../../lib/supabase/queries/parties';
import { usePartyDetailList } from '../hooks/usePartyDetailList';
import { getErrorMessage } from '../../../lib/utils/errorExtraction';
import { useInvalidate } from '../../../lib/supabase/hooks/useInvalidate';
import { useAuth } from '../../../providers/AuthProvider';
import { trackEvent } from '../../../lib/telemetry/analytics';
import { compressImage } from '../../../lib/media/compress';
import { logger } from '../../../lib/telemetry/logger';
import * as Burnt from 'burnt';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { Ionicons } from '@expo/vector-icons';
import { TAB_BAR_HEIGHT } from '../../../navigation/CustomTabBar';

type Props = NativeStackScreenProps<PartyStackParamList, 'PartyList'>;

export default function PartyListScreen({ navigation }: Props) {
  const { userId } = useAuth();
  const dialog = useDialog();
  const insets = useSafeAreaInsets();
  const { theme } = useUnistyles();

  const invalidate = useInvalidate();
  const {
    partyDetails,
    loading: partiesLoading,
    error: partiesError,
    refetch: refetchParties,
  } = usePartyDetailList(userId);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (name: string, bannerUri: string | null) => {
    if (!name.trim()) {
      await dialog.error('Missing info', 'Name cannot be empty');
      return;
    }
    if (!bannerUri) {
      await dialog.error('Missing info', 'Choose a banner image');
      return;
    }

    setLoading(true);
    let bannerPath = null;

    try {
      const party = await createParty({ name, owner_id: userId });

      if (bannerUri) {
        const compressed = await compressImage(bannerUri);
        bannerPath = await partiesStorage.upload(
          party.id,
          { type: 'banner' },
          compressed.uri,
        );
      }

      await updatePartyById(party.id, { banner_path: bannerPath });
      trackEvent('party_created', { party_id: party.id });
      invalidate.parties();
      Burnt.toast({
        title: 'Party created',
        preset: 'done',
        haptic: 'success',
      });
    } catch (err) {
      if (bannerPath) {
        await partiesStorage.remove([bannerPath]);
      }
      logger.error('Error creating party', { err });
      await dialog.error('Failed to Create a Party', getErrorMessage(err));
    } finally {
      setLoading(false);
      setModalVisible(false);
    }
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.container}>
        <Text style={styles.screenTitle}>Your Parties</Text>
        <Divider style={{ marginVertical: theme.spacing.xl }} />
        <FlatList
          data={partyDetails}
          keyExtractor={(p) => p.id}
          refreshing={partiesLoading}
          onRefresh={refetchParties}
          renderItem={({ item, index }) => (
            <AnimatedListItem index={index}>
              <PartyCard
                name={item.name}
                avatarUri={item.avatarUrl}
                bannerUri={item.bannerUrl}
                members={item.members}
                onPress={() =>
                  navigation.navigate('PartyDetail', { partyId: item.id })
                }
              />
            </AnimatedListItem>
          )}
          ListEmptyComponent={
            partiesError ? (
              <DataFallbackScreen onAction={refetchParties} />
            ) : partiesLoading ? (
              <Spinner style={{ paddingVertical: theme.spacing.xl }} />
            ) : (
              <EmptyState
                icon="users"
                title="No parties yet"
                message="Create your first party to start linking with friends."
                action={
                  <Button
                    title="Create a Party"
                    variant="primary"
                    size="md"
                    onPress={() => setModalVisible(true)}
                  />
                }
              />
            )
          }
        />
      </View>

      {partyDetails.length ? (
        <Pressable
          onPress={() => setModalVisible(true)}
          style={[
            styles.fab,
            {
              bottom: TAB_BAR_HEIGHT,
            },
          ]}
        >
          <Ionicons
            name="add"
            size={theme.iconSizes.lg}
            color={theme.colors.white}
          />
        </Pressable>
      ) : null}

      <CreatePartyModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={(name, bannerUri) => handleSubmit(name, bannerUri)}
        loading={loading}
      />
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  root: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.lg,
  },
  screenTitle: {
    fontSize: theme.fontSizes.xl,
    fontWeight: theme.fontWeights.bold,
    color: theme.colors.textPrimary,
  },
  fab: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radii.full,
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    right: 30,
  },
  fabText: {
    color: theme.colors.textInverse,
    fontSize: theme.fontSizes.sm,
    fontWeight: theme.fontWeights.semibold,
  },
}));
