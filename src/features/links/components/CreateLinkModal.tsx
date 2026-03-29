import { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { Button, Modal, ModalHeader, TextField } from '../../../components';
import { StyleSheet } from 'react-native-unistyles';
import LocationPicker, { StagedLocation } from './LocationPicker';
import { LinkLocationRow } from '../../../lib/models';

interface Props {
  visible: boolean;
  initialName?: string;
  initialLocations?: LinkLocationRow[];
  loading?: boolean;
  onClose: () => void;
  onSubmit: (name: string, locations: StagedLocation[]) => Promise<void>;
}

export default function CreateLinkModal({
  visible,
  initialName = '',
  initialLocations = [],
  loading,
  onClose,
  onSubmit,
}: Props) {
  const [name, setName] = useState(initialName);
  const [locations, setLocations] =
    useState<StagedLocation[]>(initialLocations);
  const [localLoading, setLocalLoading] = useState(false);

  const isEditMode = initialName !== '';

  useEffect(() => {
    if (visible) {
      setName(initialName);
      setLocations(initialLocations);
    }
  }, [visible, initialName, initialLocations]);

  const handleSubmit = async () => {
    if (!name.trim()) return;
    setLocalLoading(true);
    try {
      await onSubmit(name.trim(), locations);
      if (!isEditMode) {
        setName('');
      }
    } finally {
      setLocalLoading(false);
    }
  };

  const handleClose = () => {
    setName(isEditMode ? initialName : '');
    setLocations(isEditMode ? initialLocations : []);
    onClose();
  };

  const hasChanges =
    name.trim() !== initialName ||
    locations.length !== initialLocations.length ||
    locations.some(
      (loc, i) => loc.mapbox_id !== initialLocations[i]?.mapbox_id,
    );

  return (
    <Modal
      visible={visible}
      onClose={handleClose}
      animationType="slide"
      scrollEnabled={false}
    >
      <ModalHeader
        title={isEditMode ? 'Edit Link' : 'Start a Link'}
        onClose={handleClose}
      />

      <TextField
        header="Link Name"
        value={name}
        onChangeText={setName}
        placeholder="e.g. Beach Day, Birthday Party"
        autoCapitalize="words"
        maxLength={50}
        returnKeyType="done"
      />

      {isEditMode && (
        <View style={styles.locationSection}>
          <Text style={styles.locationLabel}>Locations</Text>
          <LocationPicker locations={locations} onChange={setLocations} />
        </View>
      )}

      <View style={styles.submitWrap}>
        <Button
          title={isEditMode ? 'Save Changes' : 'Start Link'}
          size="md"
          onPress={handleSubmit}
          loading={loading || localLoading}
          disabled={!name.trim() || (isEditMode && !hasChanges)}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create((theme) => ({
  locationSection: {
    marginTop: theme.spacing.lg,
  },
  locationLabel: {
    fontSize: theme.fontSizes.xs,
    fontWeight: theme.fontWeights.medium,
    color: theme.colors.iconSecondary,
    marginBottom: theme.spacing.xs,
  },
  submitWrap: {
    marginTop: theme.spacing['2xl'],
  },
}));
