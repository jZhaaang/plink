import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PartyStackParamList } from '../../../navigation/types';
import { parties as partiesStorage } from '../../../lib/supabase/storage/parties';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { FlatList, View, Text } from 'react-native';
import { PartyCard } from '../components/PartyCard';
import {
  Button,
  DataFallbackScreen,
  Divider,
  EmptyState,
  LoadingScreen,
} from '../../../components';
import { useDialog } from '../../../providers/DialogProvider';
import { useState } from 'react';
import CreatePartyModal from '../components/CreatePartyModal';
import {
  createParty,
  updatePartyById,
} from '../../../lib/supabase/queries/parties';
import { usePartyListItems } from '../hooks/usePartyListItems';
import { getErrorMessage } from '../../../lib/utils/errorExtraction';
import { useInvalidate } from '../../../lib/supabase/hooks/useInvalidate';
import { useAuth } from '../../../providers/AuthProvider';
import { trackEvent } from '../../../lib/telemetry/analytics';
import { compressImage } from '../../../lib/media/compress';
import { logger } from '../../../lib/telemetry/logger';
import * as Burnt from 'burnt';
import { StyleSheet } from 'react-native-unistyles';

type Props = NativeStackScreenProps<PartyStackParamList, 'PartyList'>;

export default function PartyListScreen({ navigation }: Props) {
  const { userId } = useAuth();
  const dialog = useDialog();
  const invalidate = useInvalidate();
  const insets = useSafeAreaInsets();

  const {
    parties,
    loading: partiesLoading,
    error: partiesError,
    refetch: refetchParties,
  } = usePartyListItems(userId);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  if (partiesLoading) return <LoadingScreen label="Loading..." />;
  if (partiesError) return <DataFallbackScreen onAction={refetchParties} />;

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
    try {
      const party = await createParty({ name, owner_id: userId });

      let banner_path = null;
      if (bannerUri) {
        const compressed = await compressImage(bannerUri);
        banner_path = await partiesStorage.upload(party.id, compressed.uri);
      }

      await updatePartyById(party.id, { banner_path });
      trackEvent('party_created', { party_id: party.id });
      invalidate.parties();
      Burnt.toast({
        title: 'Party created',
        preset: 'done',
        haptic: 'success',
      });
    } catch (err) {
      logger.error('Error creating party', { err });
      await dialog.error('Failed to Create a Party', getErrorMessage(err));
    } finally {
      setLoading(false);
      setModalVisible(false);
    }
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.screenTitle}>Your Parties</Text>
        <Divider />
        <FlatList
          data={parties}
          keyExtractor={(p) => p.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          refreshing={partiesLoading}
          onRefresh={refetchParties}
          renderItem={({ item }) => (
            <PartyCard
              name={item.name}
              bannerUri={item.bannerUrl}
              members={item.members}
              onPress={() =>
                navigation.navigate('PartyDetail', { partyId: item.id })
              }
            />
          )}
          ListEmptyComponent={
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
          }
        />
      </View>

      {parties.length ? (
        <Button
          title="Create a Party"
          onPress={() => setModalVisible(true)}
          style={[styles.fab, { bottom: insets.bottom }]}
        />
      ) : null}

      <CreatePartyModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={(name, bannerUri) => handleSubmit(name, bannerUri)}
        loading={loading}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create((theme) => ({
  safeArea: {
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
    marginBottom: theme.spacing.lg,
  },
  fab: {
    position: 'absolute',
    right: 20,
  },
  fabText: {
    color: theme.colors.textInverse,
    fontSize: theme.fontSizes.sm,
    fontWeight: theme.fontWeights.semibold,
  },
}));
