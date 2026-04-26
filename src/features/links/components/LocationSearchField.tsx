import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { SearchSuggestion } from '../../../lib/mapbox/types';
import { useCallback, useState } from 'react';
import { Keyboard, Pressable, ScrollView, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import {
  Divider,
  Row,
  Spinner,
  Stack,
  Text,
  TextField,
} from '../../../components';

interface LocationSearchFieldProps {
  query: string;
  onQueryChange: (query: string) => void;
  results: SearchSuggestion[];
  loading: boolean;
  shouldSearch: boolean;
  onSelect: (item: SearchSuggestion) => Promise<void>;
  onBack?: () => void;
  currentMapboxId?: string | null;
}

export default function LocationSearchField({
  query,
  onQueryChange,
  results,
  loading,
  shouldSearch,
  onSelect,
  onBack,
  currentMapboxId,
}: LocationSearchFieldProps) {
  const { theme } = useUnistyles();
  const [savingId, setSavingId] = useState<string | null>(null);
  const [searchHeight, setSearchHeight] = useState(0);

  const dropdownTop = searchHeight * 0.45;
  const hiddenTop = searchHeight - dropdownTop;

  const handleSelect = useCallback(
    async (item: SearchSuggestion) => {
      if (savingId) return;
      setSavingId(item.mapbox_id);
      Keyboard.dismiss();
      try {
        await onSelect(item);
      } finally {
        setSavingId(null);
      }
    },
    [savingId, onSelect],
  );

  const trimmed = query.trim();
  const showLoading = loading;
  const showEmpty = shouldSearch && !loading && results.length === 0;

  return (
    <View style={styles.container}>
      {onBack && (
        <Pressable onPress={onBack} style={styles.backRow}>
          <Feather name="chevron-left" size={16} color={theme.colors.primary} />
          <Text variant="labelSm" color="accent">
            Back to list
          </Text>
        </Pressable>
      )}

      <View style={styles.searchStack}>
        <View
          style={styles.searchFieldWrap}
          onLayout={(e) => setSearchHeight(e.nativeEvent.layout.height)}
        >
          <TextField
            value={query}
            onChangeText={onQueryChange}
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
                <Pressable onPress={() => onQueryChange('')} hitSlop={8}>
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

        {shouldSearch && (
          <View style={[styles.dropdown, { top: dropdownTop }]}>
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
                  const isCurrent = item.mapbox_id === currentMapboxId;
                  const subtitle = [item.address, item.place_formatted]
                    .filter(Boolean)
                    .join(', ');
                  return (
                    <View key={item.mapbox_id}>
                      {i > 0 && <Divider />}
                      <Pressable
                        onPress={() => handleSelect(item)}
                        style={({ pressed }) => [
                          styles.resultRow,
                          pressed && { opacity: theme.opacity.pressed },
                        ]}
                      >
                        <Row align="center">
                          <View style={styles.mapPin}>
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
                            {subtitle ? (
                              <Text
                                variant="bodySm"
                                color="tertiary"
                                numberOfLines={2}
                              >
                                {subtitle}
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
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    overflow: 'visible',
    zIndex: 30,
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
  },
  searchStack: {
    position: 'relative',
    overflow: 'visible',
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
  mapPin: {
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
