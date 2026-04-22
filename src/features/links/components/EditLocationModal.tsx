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
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet } from 'react-native-unistyles';
import * as Burnt from 'burnt';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { ModalHeader } from '../../../components';
import {
  LinkLocationInsert,
  LinkLocationRow,
  LinkLocationUpdate,
} from '../../../lib/models';
import { SearchSuggestion } from '../../../lib/mapbox/types';
import { randomUUID } from 'expo-crypto';
import { retrievePlace, suggestPlaces } from '../../../lib/mapbox/placeSearch';

interface EditLocationSheetProps {
  visible: boolean;
  location: LinkLocationRow;
  onClose: () => void;
  onSave: (update: LinkLocationUpdate) => Promise<void>;
}

export default function EditLocationModal({
  visible,
  location,
  onClose,
  onSave,
}: EditLocationSheetProps) {
  const { theme } = useUnistyles();
  const sheetRef = useRef<BottomSheetModal>(null);

  const [currentLocation, setCurrentLocation] =
    useState<LinkLocationInsert>(location);

  const [query, setQuery] = useState(location.name);
  const [fetching, setFetching] = useState(false);
  const [searchPending, setSearchPending] = useState(false);
  const [results, setResults] = useState<SearchSuggestion[]>([]);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [sessionToken, setSessionToken] = useState('');
  const [searchHeight, setSearchHeight] = useState(0);

  const subtitle = [currentLocation.address, currentLocation.place_formatted]
    .filter(Boolean)
    .join(', ');
  const trimmed = query.trim();
  const showLoading = searchPending || fetching;
  const showEmpty =
    trimmed.length >= 3 &&
    trimmed !== currentLocation.name &&
    !showLoading &&
    results.length === 0;
  const hasDropdown = trimmed.length >= 3 && trimmed !== currentLocation.name;
  const dropdownTop = searchHeight * 0.45;
  const hiddenTop = searchHeight - dropdownTop;

  useEffect(() => {
    if (visible) {
      sheetRef.current?.present();
      setCurrentLocation(location);
      setQuery(location.name);
      setResults([]);
      setFetching(false);
      setSessionToken(randomUUID());
    } else {
      sheetRef.current?.dismiss();
    }
  }, [visible, location.id, location.name]);

  useEffect(() => {
    if (!visible) return;

    if (trimmed.length < 3 || trimmed === currentLocation.name) {
      setResults([]);
      setFetching(false);
      setSearchPending(false);
      return;
    }

    setSearchPending(true);

    const timer = setTimeout(async () => {
      setFetching(true);
      try {
        const suggestions = await suggestPlaces(trimmed, sessionToken, {
          longitude: location.longitude,
          latitude: location.latitude,
        });
        setResults(suggestions);
      } catch {
        setResults([]);
      } finally {
        setFetching(false);
        setSearchPending(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [query, sessionToken, visible, currentLocation.name]);

  const handleClose = useCallback(() => {
    Keyboard.dismiss();
    onClose();
  }, [onClose]);

  const handleSelect = useCallback(async (item: SearchSuggestion) => {
    if (savingId) return;
    setSavingId(item.mapbox_id);
    Keyboard.dismiss();

    try {
      const place = await retrievePlace(item.mapbox_id, sessionToken);
      if (!place) {
        setSavingId(null);
        return;
      }

      const full_address = [place.address, item.place_formatted]
        .filter(Boolean)
        .join(', ');

      await onSave({
        name: place.name,
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
        title: 'Location updated',
        preset: 'done',
        haptic: 'success',
      });

      setQuery('');
      setResults([]);
      setSessionToken(randomUUID());
      onClose();
    } finally {
      setSavingId(null);
    }
  }, []);

  return (
    <Modal
      visible={visible}
      onClose={handleClose}
      animationType="fade"
      scrollEnabled={false}
    >
      <ModalHeader title="Edit Location" onClose={handleClose} />

      <View style={styles.searchStack}>
        <View
          style={styles.searchFieldWrap}
          onLayout={(e) => setSearchHeight(e.nativeEvent.layout.height)}
        >
          <TextField
            value={query}
            onChangeText={setQuery}
            placeholder="Search for a place..."
            autoFocus
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
                  const isCurrent = item.mapbox_id === location.mapbox_id;
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
      <Row align="center" gap="md" style={styles.currentCard}>
        <View style={styles.mapIconWrap}>
          <Feather name="map-pin" size={14} color={theme.colors.primary} />
        </View>
        <Stack flex={1}>
          <Text variant="labelSm" color="tertiary">
            Currently
          </Text>
          <Text variant="headingMd" color="primary" numberOfLines={1}>
            {currentLocation.name}
          </Text>
          {subtitle ? (
            <Text variant="bodySm" color="tertiary">
              {subtitle}
            </Text>
          ) : null}
        </Stack>
      </Row>
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
