import { Keyboard, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useUnistyles } from 'react-native-unistyles';
import { Modal, Row, Stack, Text } from '../../../components';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet } from 'react-native-unistyles';
import * as Burnt from 'burnt';
import * as Location from 'expo-location';
import { ModalHeader } from '../../../components';
import { LinkLocationInsert, LinkLocationRow } from '../../../lib/models';
import { SearchSuggestion } from '../../../lib/mapbox/types';
import { useLocationSearch } from '../hooks/useLocationSearch';
import LocationSearchField from './LocationSearchField';

interface LocationPickerModalProps {
  visible: boolean;
  location?: LinkLocationRow;
  onClose: () => void;
  onSave: (data: LinkLocationInsert) => Promise<void>;
}

export default function LocationPickerModal({
  visible,
  location,
  onClose,
  onSave,
}: LocationPickerModalProps) {
  const { theme } = useUnistyles();

  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const proximity = useMemo(
    () =>
      location
        ? { latitude: location.latitude, longitude: location.longitude }
        : userLocation,
    [location?.latitude, location?.longitude, userLocation],
  );
  const {
    query,
    setQuery,
    results,
    loading,
    shouldSearch,
    retrieveSelected,
    reset,
  } = useLocationSearch({
    initialQuery: location?.name ?? '',
    proximity,
    skipQuery: location?.name,
  });

  const title = location ? 'Edit Location' : 'Add Location';

  const locationSubtitle = [location?.address, location?.place_formatted]
    .filter(Boolean)
    .join(', ');

  useEffect(() => {
    if (visible) {
      reset(location?.name ?? '');

      (async () => {
        try {
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status !== 'granted') return;

          const last = await Location.getLastKnownPositionAsync();
          if (last) {
            setUserLocation({
              latitude: last.coords.latitude,
              longitude: last.coords.longitude,
            });
            return;
          }

          const current = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          setUserLocation({
            latitude: current.coords.latitude,
            longitude: current.coords.longitude,
          });
        } catch {
          // silent fail
        }
      })();
    }
  }, [visible, location?.id, location?.name]);

  const handleClose = useCallback(() => {
    Keyboard.dismiss();
    onClose();
  }, [onClose]);

  const handleSelect = useCallback(
    async (item: SearchSuggestion) => {
      const place = await retrieveSelected(item.mapbox_id);
      if (!place) return;

      const full_address = [place.address, item.place_formatted]
        .filter(Boolean)
        .join(', ');

      await onSave({
        name: place.name,
        link_id: location?.link_id,
        address: place.address,
        place_formatted: item.place_formatted,
        full_address,
        mapbox_id: place.mapbox_id,
        latitude: place.latitude,
        longitude: place.longitude,
        source: 'user',
        confirmed_at: new Date().toISOString(),
      });

      Burnt.toast({
        title: location ? 'Location edited' : 'Location added',
        preset: 'done',
        haptic: 'success',
      });

      reset();
      onClose();
    },
    [location, onSave, onClose, retrieveSelected, reset],
  );

  return (
    <Modal
      visible={visible}
      onClose={handleClose}
      animationType="fade"
      scrollEnabled={false}
    >
      <ModalHeader title={title} onClose={handleClose} />

      <LocationSearchField
        query={query}
        onQueryChange={setQuery}
        results={results}
        loading={loading}
        shouldSearch={shouldSearch}
        onSelect={handleSelect}
        currentMapboxId={location?.mapbox_id}
      />

      {location && (
        <Row align="center" gap="md" style={styles.currentCard}>
          <View style={styles.mapIconWrap}>
            <Feather name="map-pin" size={14} color={theme.colors.primary} />
          </View>
          <Stack flex={1}>
            <Text variant="labelSm" color="tertiary">
              Currently
            </Text>
            <Text variant="headingMd" color="primary" numberOfLines={1}>
              {location.name}
            </Text>
            {locationSubtitle ? (
              <Text variant="bodySm" color="tertiary">
                {locationSubtitle}
              </Text>
            ) : null}
          </Stack>
        </Row>
      )}
    </Modal>
  );
}

const styles = StyleSheet.create((theme) => ({
  currentCard: {
    padding: theme.spacing.md,
    marginTop: theme.spacing.md,
    backgroundColor: theme.colors.surfacePressed,
    borderRadius: theme.radii.xl,
  },
  mapIconWrap: {
    width: theme.iconSizes.xl,
    height: theme.iconSizes.xl,
    borderRadius: theme.radii.full,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
}));
