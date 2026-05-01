import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { LinkLocationRow } from '../../../lib/models';
import { useCallback, useEffect, useState } from 'react';
import * as Location from 'expo-location';
import { MapboxPlace } from '../../../lib/mapbox/types';
import { randomUUID } from 'expo-crypto';
import {
  Button,
  Modal,
  ModalHeader,
  Row,
  Stack,
  Text,
} from '../../../components';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import DraggableFlatList, {
  RenderItemParams,
} from 'react-native-draggable-flatlist';
import { Pressable } from 'react-native-gesture-handler';
import { Feather } from '@expo/vector-icons';
import LocationSearchField from './LocationSearchField';

type LocationDraft = Omit<LinkLocationRow, 'id' | 'link_id'> & {
  _key: string;
  id?: string;
  link_id?: string;
};
type EditState =
  | { mode: 'idle' }
  | { mode: 'editing'; key: string }
  | { mode: 'adding' };

type LocationManageRowProps = {
  location: LocationDraft;
  isDragging: boolean;
  onDrag: () => void;
  onEdit: () => void;
  onDelete: () => void;
} & (
  | { isEditing: false }
  | {
      isEditing: true;
      onCancel: () => void;
      proximity: { latitude: number; longitude: number } | null;
      onSelect: (place: MapboxPlace) => Promise<void>;
    }
);

function LocationManageRow(props: LocationManageRowProps) {
  const { theme } = useUnistyles();
  const { location, isDragging, onDrag, onEdit, onDelete } = props;
  const lift = useSharedValue(0);

  useEffect(() => {
    lift.value = withSpring(isDragging ? 1 : 0, {
      damping: 70,
      stiffness: 300,
    });
  }, [isDragging]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + lift.value * 0.02 }],
    backgroundColor: isDragging
      ? theme.colors.surfacePressed
      : theme.colors.surface,
    borderRadius: theme.radii.md,
  }));

  if (props.isEditing) {
    return (
      <View style={[styles.row, styles.editRow]}>
        <Pressable onPress={props.onCancel} hitSlop={8} style={styles.handle}>
          <Feather name="chevron-left" size={18} color={theme.colors.primary} />
        </Pressable>

        <View style={styles.editFieldWrap}>
          <LocationSearchField
            initialQuery={location.name}
            proximity={props.proximity}
            onSelect={props.onSelect}
          />
        </View>

        <Pressable onPress={onDelete} hitSlop={8} style={styles.actionButton}>
          <Feather name="trash-2" size={14} color={theme.colors.error} />
        </Pressable>
      </View>
    );
  }

  return (
    <Animated.View style={[styles.row, animatedStyle]}>
      <Pressable
        onLongPress={onDrag}
        delayLongPress={100}
        hitSlop={8}
        style={styles.handle}
      >
        <Feather name="menu" size={18} color={theme.colors.iconSecondary} />
      </Pressable>

      <Stack style={{ flex: 1, minWidth: 0 }}>
        <Text variant="headingSm" color="primary" numberOfLines={1}>
          {location.name}
        </Text>
        {location.address ? (
          <Text variant="bodySm" color="tertiary" numberOfLines={1}>
            {location.address}
          </Text>
        ) : null}
      </Stack>

      <Pressable onPress={onEdit} hitSlop={8} style={styles.actionButton}>
        <Feather name="edit-2" size={14} color={theme.colors.iconSecondary} />
      </Pressable>
    </Animated.View>
  );
}

interface ManageLocationsModalProps {
  visible: boolean;
  locations: LinkLocationRow[];
  onClose: () => void;
  onSave: (locations: LocationDraft[]) => Promise<void>;
}

const toDraft = (location: LinkLocationRow): LocationDraft => ({
  ...location,
  _key: location.id,
});

export default function ManageLocationsModal({
  visible,
  locations,
  onClose,
  onSave,
}: ManageLocationsModalProps) {
  const { theme } = useUnistyles();

  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [locationDrafts, setLocationDrafts] = useState<LocationDraft[]>([]);
  const [editState, setEditState] = useState<EditState>({ mode: 'idle' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible) {
      setLocationDrafts(locations.map(toDraft));
      setEditState({ mode: 'idle' });

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
  }, [visible]);

  const handleConfirm = useCallback(async () => {
    setSaving(true);
    try {
      await onSave(locationDrafts);
      onClose();
    } finally {
      setSaving(false);
    }
  }, [locationDrafts, onSave, onClose]);

  const handleSelectPlace = useCallback(
    async (place: MapboxPlace) => {
      if (editState.mode === 'editing') {
        setLocationDrafts((prev) =>
          prev.map((loc) =>
            loc._key === editState.key
              ? {
                  ...loc,
                  name: place.name,
                  address: place.address,
                  place_formatted: place.placeFormatted,
                  full_address: place.fullAddress,
                  latitude: place.latitude,
                  longitude: place.longitude,
                  mapbox_id: place.mapbox_id,
                  source: 'user',
                  confirmed_at: new Date().toISOString(),
                }
              : loc,
          ),
        );
      } else if (editState.mode === 'adding') {
        setLocationDrafts((prev) => [
          ...prev,
          {
            _key: randomUUID(),
            id: randomUUID(),
            name: place.name,
            address: place.address,
            place_formatted: place.placeFormatted,
            full_address: place.fullAddress,
            latitude: place.latitude,
            longitude: place.longitude,
            mapbox_id: place.mapbox_id,
            order_index: prev.length,
            source: 'user',
            confirmed_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
          },
        ]);
      }
      setEditState({ mode: 'idle' });
    },
    [editState],
  );

  const handleDelete = useCallback((key: string) => {
    setLocationDrafts((prev) =>
      prev.filter((location) => location._key !== key),
    );
  }, []);

  const renderItem = useCallback(
    ({ item, drag, isActive }: RenderItemParams<LocationDraft>) => (
      <LocationManageRow
        location={item}
        isDragging={isActive}
        isEditing={false}
        onDrag={drag}
        onEdit={() => setEditState({ mode: 'editing', key: item._key })}
        onDelete={() => handleDelete(item._key)}
      />
    ),
    [handleDelete],
  );

  return (
    <Modal visible={visible} onClose={onClose} scrollEnabled={false}>
      <ModalHeader title="Manage Locations" onClose={onClose} />

      {editState.mode !== 'idle' ? (
        <View style={{ overflow: 'visible' }}>
          {locationDrafts.map((location) => {
            const isActiveRow =
              editState.mode === 'editing' && editState.key === location._key;
            return (
              <LocationManageRow
                key={location._key}
                location={location}
                isDragging={false}
                isEditing={isActiveRow}
                onDrag={() => {}}
                onEdit={() =>
                  setEditState({ mode: 'editing', key: location._key })
                }
                onDelete={() => handleDelete(location._key)}
                {...(isActiveRow && {
                  onCancel: () => setEditState({ mode: 'idle' }),
                  proximity: userLocation,
                  onSelect: handleSelectPlace,
                })}
              />
            );
          })}
        </View>
      ) : (
        <DraggableFlatList
          data={locationDrafts}
          keyExtractor={(item) => item._key}
          renderItem={renderItem}
          onDragEnd={({ data }) => setLocationDrafts(data)}
          style={{ maxHeight: 320 }}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text variant="bodySm" color="tertiary">
                No locations yet.
              </Text>
            </View>
          }
        />
      )}

      {editState.mode === 'adding' ? (
        <View style={[styles.row, styles.editRow]}>
          <Pressable
            onPress={() => setEditState({ mode: 'idle' })}
            hitSlop={8}
            style={styles.handle}
          >
            <Feather
              name="chevron-left"
              size={18}
              color={theme.colors.primary}
            />
          </Pressable>
          <View style={styles.editFieldWrap}>
            <LocationSearchField
              initialQuery=""
              proximity={userLocation}
              onSelect={handleSelectPlace}
            />
          </View>
        </View>
      ) : (
        <Pressable
          onPress={() => setEditState({ mode: 'adding' })}
          style={({ pressed }) => [
            styles.addRow,
            pressed && { opacity: theme.opacity.pressed },
          ]}
        >
          <View style={styles.handle}>
            <Feather name="plus" size={18} color={theme.colors.primary} />
          </View>
          <Text variant="bodyMd" color="accent">
            Add location
          </Text>
        </Pressable>
      )}

      <Row gap="sm" style={styles.footer}>
        <Button
          title="Cancel"
          variant="outline"
          onPress={onClose}
          style={{ flex: 1 }}
          disabled={saving}
        />
        <Button
          title="Confirm"
          variant="primary"
          onPress={handleConfirm}
          loading={saving}
          style={{ flex: 1 }}
        />
      </Row>
    </Modal>
  );
}

const styles = StyleSheet.create((theme) => ({
  emptyState: {
    paddingVertical: theme.spacing.xl,
    alignItems: 'center',
  },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    minHeight: 52,
    paddingHorizontal: theme.spacing.sm,
  },
  footer: {
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.sm,
    minHeight: 52,
  },
  editRow: {
    overflow: 'visible',
    zIndex: 10,
  },
  editFieldWrap: {
    flex: 1,
    minWidth: 0,
    overflow: 'visible',
  },
  handle: {
    width: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButton: {
    width: theme.iconSizes.xl,
    height: theme.iconSizes.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radii.md,
    backgroundColor: theme.colors.surfacePressed,
  },
}));
