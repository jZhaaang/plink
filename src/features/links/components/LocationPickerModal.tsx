import { Keyboard, Pressable, ScrollView, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useUnistyles } from 'react-native-unistyles';
import {
  Divider,
  Modal,
  Row,
  Spinner,
  Stack,
  Text,
  TextField,
} from '../../../components';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet } from 'react-native-unistyles';
import * as Burnt from 'burnt';
import * as Location from 'expo-location';
import { ModalHeader } from '../../../components';
import { LinkLocationInsert, LinkLocationRow } from '../../../lib/models';
import { SearchSuggestion } from '../../../lib/mapbox/types';
import { useLocationSearch } from '../hooks/useLocationSearch';

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

  const [savingId, setSavingId] = useState<string | null>(null);
  const [searchHeight, setSearchHeight] = useState(0);

  const title = location ? 'Edit Location' : 'Add Location';

  const locationSubtitle = [location?.address, location?.place_formatted]
    .filter(Boolean)
    .join(', ');
  const trimmed = query.trim();
  const showLoading = loading;
  const showEmpty = shouldSearch && !loading && results.length === 0;
  const hasDropdown = shouldSearch;
  const dropdownTop = searchHeight * 0.45;
  const hiddenTop = searchHeight - dropdownTop;

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
      if (savingId) return;
      setSavingId(item.mapbox_id);
      Keyboard.dismiss();

      try {
        const place = await retrieveSelected(item.mapbox_id);
        if (!place) {
          setSavingId(null);
          return;
        }

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
      } finally {
        setSavingId(null);
      }
    },
    [savingId, location, onSave, onClose],
  );

  return (
    <Modal
      visible={visible}
      onClose={handleClose}
      animationType="fade"
      scrollEnabled={false}
    >
      <ModalHeader title={title} onClose={handleClose} />

      <View style={styles.searchStack}>
        <View
          style={styles.searchFieldWrap}
          onLayout={(e) => setSearchHeight(e.nativeEvent.layout.height)}
        >
          <TextField
            value={query}
            onChangeText={setQuery}
            placeholder="Search for a place..."
            selectTextOnFocus
            returnKeyType="search"
            autoCorrect={false}
            left={
              <Feather
                name="search"
                size={16}
                color={theme.colors.iconSecondary}
              />
            }
            right={
              query.length > 0 ? (
                <Pressable onPress={() => setQuery('')} hitSlop={8}>
                  <View style={styles.clearButton}>
                    <Feather
                      name="x"
                      size={12}
                      color={theme.colors.textInverse}
                    />
                  </View>
                </Pressable>
              ) : null
            }
          />
        </View>

        {hasDropdown && (
          <View style={[{ top: dropdownTop }, styles.dropdown]}>
            {showLoading && (
              <Stack
                align="center"
                style={[styles.dropdownState, { paddingTop: hiddenTop }]}
              >
                <Spinner size="small" />
              </Stack>
            )}

            {showEmpty && (
              <Stack
                align="center"
                style={[styles.dropdownState, { paddingTop: hiddenTop }]}
              >
                <Feather
                  name="search"
                  size={22}
                  color={theme.colors.iconSecondary}
                />
                <Text
                  variant="bodySm"
                  color="tertiary"
                  style={{ marginTop: theme.spacing.sm }}
                >
                  No places found for {trimmed}
                </Text>
              </Stack>
            )}

            {!showLoading && results.length > 0 && (
              <ScrollView
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="on-drag"
                onScrollBeginDrag={Keyboard.dismiss}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.dropdownContent}
                nestedScrollEnabled
              >
                {results.map((item, i) => {
                  const isCurrent = item.mapbox_id === location?.mapbox_id;
                  const itemSubtitle = [item.address, item.place_formatted]
                    .filter(Boolean)
                    .join(', ');
                  return (
                    <View key={item.mapbox_id}>
                      {i > 0 && <Divider />}
                      <Pressable
                        onPress={() => handleSelect(item)}
                        style={({ pressed }) => [
                          styles.resultRow,
                          pressed && { opacity: theme.opacity.disabled },
                        ]}
                      >
                        <Row align="center">
                          <View style={styles.mapIconWrap}>
                            {savingId === item.mapbox_id ? (
                              <Spinner size="small" />
                            ) : (
                              <Feather
                                name="map-pin"
                                size={14}
                                color={
                                  isCurrent
                                    ? theme.colors.primary
                                    : theme.colors.iconSecondary
                                }
                              />
                            )}
                          </View>
                          <Stack flex={1}>
                            <Text
                              variant="bodyMd"
                              color="primary"
                              numberOfLines={1}
                            >
                              {item.name}
                            </Text>
                            {itemSubtitle ? (
                              <Text
                                variant="bodySm"
                                color="tertiary"
                                numberOfLines={2}
                              >
                                {itemSubtitle}
                              </Text>
                            ) : null}
                          </Stack>
                          <Feather
                            name="chevron-right"
                            size={16}
                            color={theme.colors.iconSecondary}
                          />
                        </Row>
                      </Pressable>
                    </View>
                  );
                })}
              </ScrollView>
            )}
          </View>
        )}
      </View>
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
  container: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
  },
  body: {
    position: 'relative',
    overflow: 'visible',
  },
  searchStack: {
    position: 'relative',
    overflow: 'visible',
    zIndex: 30,
  },
  searchFieldWrap: {
    zIndex: 40,
    elevation: 40,
  },
  dropdown: {
    position: 'absolute',
    left: 0,
    right: 0,
    maxHeight: 280,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.xl,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    overflow: 'hidden',
    zIndex: 20,
    elevation: 20,
    ...theme.shadows.lg,
  },
  dropdownContent: {
    paddingTop: theme.spacing.xl,
  },
  dropdownState: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    minHeight: 96,
  },
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
  clearButton: {
    width: theme.iconSizes.sm,
    height: theme.iconSizes.sm,
    borderRadius: theme.radii.full,
    backgroundColor: theme.colors.iconSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultRow: {
    paddingVertical: theme.spacing.sm,
    paddingLeft: theme.spacing.xs,
    paddingRight: theme.spacing.md,
  },
}));
