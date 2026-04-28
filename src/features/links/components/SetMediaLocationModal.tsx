import { Pressable, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { Modal, ModalHeader, Row, Stack, Text } from '../../../components';
import { LinkLocationRow } from '../../../lib/models';

interface SetMediaLocationModalProps {
  visible: boolean;
  locations: LinkLocationRow[];
  onClose: () => void;
  onSelect: (locationId: string | null) => void;
}

export default function SetMediaLocationModal({
  visible,
  locations,
  onClose,
  onSelect,
}: SetMediaLocationModalProps) {
  const { theme } = useUnistyles();

  const options: { id: string | null; name: string; address?: string }[] = [
    ...locations.map((l) => ({
      id: l.id,
      name: l.name,
      address: l.address ?? undefined,
    })),
    { id: null, name: 'No Location' },
  ];

  return (
    <Modal visible={visible} onClose={onClose} scrollEnabled={false}>
      <ModalHeader title="Set Location" onClose={onClose} />
      <Stack gap="xs">
        {options.map((opt, i) => (
          <View key={opt.id ?? 'none'}>
            {i > 0 && <View style={styles.divider} />}
            <Pressable
              onPress={() => onSelect(opt.id)}
              style={({ pressed }) => [
                styles.row,
                pressed && styles.rowPressed,
              ]}
            >
              <Row align="center" gap="md">
                <Feather
                  name={opt.id ? 'map-pin' : 'slash'}
                  size={16}
                  color={
                    opt.id ? theme.colors.primary : theme.colors.textTertiary
                  }
                />
                <Stack gap="xs" style={{ flex: 1 }}>
                  <Text
                    variant="labelMd"
                    color={opt.id ? 'primary' : 'tertiary'}
                  >
                    {opt.name}
                  </Text>
                  {opt.address && (
                    <Text variant="bodySm" color="tertiary" numberOfLines={1}>
                      {opt.address}
                    </Text>
                  )}
                </Stack>
              </Row>
            </Pressable>
          </View>
        ))}
      </Stack>
    </Modal>
  );
}

const styles = StyleSheet.create((theme) => ({
  row: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.radii.md,
  },
  rowPressed: {
    backgroundColor: theme.colors.surfacePressed,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.borderLight,
  },
}));
