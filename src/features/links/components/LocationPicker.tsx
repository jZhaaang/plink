import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { suggestPlaces, retrievePlace } from '../../../lib/mapbox/placeSearch';
import * as Location from 'expo-location';
import { randomUUID } from 'expo-crypto';
import { Row, Stack } from '../../../components';
import { SearchSuggestion } from '../../../lib/mapbox/types';

export type StagedLocation = {
  name: string;
  address: string | null;
  latitude: number;
  longitude: number;
  mapbox_id: string | null;
};

interface LocationPickerProps {
  locations: StagedLocation[];
  onChange: (locations: StagedLocation[]) => void;
}

export default function LocationPicker({
  locations,
  onChange,
}: LocationPickerProps) {
  const { theme } = useUnistyles();

  const [userLocation, setUserLocation] = useState<{
    longitude: number;
    latitude: number;
  } | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchSuggestion[]>([]);
  const [sessionToken, setSessionToken] = useState('');
  const [fetching, setFetching] = useState(false);

  const inputRef = useRef<TextInput>(null);
  const [inputHeight, setInputHeight] = useState(0);

  useEffect(() => {
    (async () => {
      const perm = await Location.requestForegroundPermissionsAsync();
      if (!perm.granted) return;

      const loc =
        (await Location.getLastKnownPositionAsync()) ??
        (await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        }));

      if (loc) {
        setUserLocation({
          longitude: loc.coords.longitude,
          latitude: loc.coords.latitude,
        });
      }
    })();
  }, []);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setFetching(true);
      try {
        setResults(
          await suggestPlaces(query, sessionToken, userLocation ?? undefined),
        );
      } catch {
        setResults([]);
      } finally {
        setFetching(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [query]);

  const openSearch = () => {
    setSessionToken(randomUUID());
    setIsSearching(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const closeSearch = () => {
    setIsSearching(false);
    setQuery('');
    setResults([]);
  };

  const handleSelect = async (suggestion: SearchSuggestion) => {
    const place = await retrievePlace(suggestion.mapbox_id, sessionToken);
    if (!place) return;

    onChange([
      ...locations,
      {
        name: place.name,
        address: place.address,
        latitude: place.latitude,
        longitude: place.longitude,
        mapbox_id: place.mapbox_id,
      },
    ]);
    closeSearch();
  };

  const handleRemove = (index: number) => {
    onChange(locations.filter((_, i) => i !== index));
  };

  const getSubtitle = (suggestion: SearchSuggestion) => {
    const parts = [suggestion.address, suggestion.place_formatted].filter(
      Boolean,
    );
    return parts.join(', ');
  };

  return (
    <Stack gap="sm">
      {/* Staged locations */}
      {locations.map((loc, i) => (
        <Row key={i} align="center" gap="sm">
          <View style={styles.pinWrap}>
            <Feather
              name="map-pin"
              size={theme.iconSizes.sm}
              color={theme.colors.primary}
            />
          </View>
          <Stack flex={1}>
            <Text style={styles.locationName} numberOfLines={1}>
              {loc.name}
            </Text>
            {loc.address && (
              <Text style={styles.locationAddress} numberOfLines={1}>
                {loc.address}
              </Text>
            )}
          </Stack>
          <Pressable onPress={() => handleRemove(i)} hitSlop={10}>
            <Feather
              name="x"
              size={theme.iconSizes.sm}
              color={theme.colors.iconSecondary}
            />
          </Pressable>
        </Row>
      ))}

      {/* Search */}
      {isSearching ? (
        <View style={styles.searchWrap}>
          <Row
            align="center"
            gap="sm"
            style={styles.searchInput}
            onLayout={(e) => setInputHeight(e.nativeEvent.layout.height)}
          >
            <Feather
              name="search"
              size={theme.iconSizes.sm}
              color={theme.colors.iconSecondary}
            />
            <TextInput
              ref={inputRef}
              style={styles.input}
              value={query}
              onChangeText={setQuery}
              placeholder="Search for a place..."
              placeholderTextColor={theme.colors.textPlaceholder}
              returnKeyType="search"
              autoCorrect={false}
            />
            {fetching ? (
              <ActivityIndicator
                size="small"
                color={theme.colors.iconSecondary}
              />
            ) : (
              <Pressable onPress={closeSearch} hitSlop={10}>
                <Feather
                  name="x"
                  size={theme.iconSizes.sm}
                  color={theme.colors.iconSecondary}
                />
              </Pressable>
            )}
          </Row>

          {/* Results */}
          {results.length > 0 && (
            <View style={styles.results(inputHeight)}>
              {results.map((suggestion, i) => (
                <Pressable
                  key={suggestion.mapbox_id}
                  onPress={() => handleSelect(suggestion)}
                  style={({ pressed }) => [
                    styles.resultRow,
                    i < results.length - 1 && styles.resultDivider,
                    pressed && { backgroundColor: theme.colors.surfacePressed },
                  ]}
                >
                  <Feather
                    name="map-pin"
                    size={13}
                    color={theme.colors.iconSecondary}
                    style={{ marginTop: theme.spacing.xs }}
                  />
                  <View style={styles.resultInfo}>
                    <Text style={styles.resultName} numberOfLines={1}>
                      {suggestion.name}
                    </Text>
                    <Text style={styles.resultAddress} numberOfLines={1}>
                      {getSubtitle(suggestion)}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </View>
          )}
        </View>
      ) : (
        <Pressable onPress={openSearch} style={styles.addRow}>
          <Feather
            name="plus"
            size={theme.iconSizes.sm}
            color={theme.colors.primary}
          />
          <Text style={styles.addText}>
            {locations.length === 0 ? 'Add a location' : 'Add another'}
          </Text>
        </Pressable>
      )}
    </Stack>
  );
}

const styles = StyleSheet.create((theme) => ({
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  pinWrap: {
    width: 28,
    height: 28,
    borderRadius: theme.radii.full,
    backgroundColor: theme.colors.accentSurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationInfo: {
    flex: 1,
  },
  locationName: {
    fontSize: theme.fontSizes.sm,
    fontWeight: theme.fontWeights.medium,
    color: theme.colors.textPrimary,
  },
  locationAddress: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textTertiary,
    marginTop: 1,
  },
  searchWrap: {
    marginTop: theme.spacing.xs,
    zIndex: 10,
    elevation: 10,
  },
  searchInput: {
    borderRadius: theme.radii.xl,
    borderWidth: 1,
    borderColor: theme.colors.borderInput,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.md,
  },
  input: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    color: theme.colors.textPrimary,
    fontSize: theme.fontSizes.sm,
  },
  results: (inputHeight: number) => ({
    position: 'absolute',
    bottom: inputHeight + theme.spacing.xs,
    left: 0,
    right: 0,
    zIndex: 10,
    elevation: 10,
    borderRadius: theme.radii.xl,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    backgroundColor: theme.colors.surface,
    overflow: 'hidden',
    ...theme.shadows.md,
  }),
  resultRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  resultDivider: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  resultInfo: {
    flex: 1,
  },
  resultName: {
    fontSize: theme.fontSizes.sm,
    fontWeight: theme.fontWeights.medium,
    color: theme.colors.textPrimary,
  },
  resultAddress: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textTertiary,
    marginTop: 1,
  },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.xs,
  },
  addText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.primary,
    fontWeight: theme.fontWeights.medium,
  },
}));
