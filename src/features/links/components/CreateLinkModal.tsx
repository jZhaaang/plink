import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Button, Modal, TextField } from '../../../components';
import { StyleSheet } from 'react-native-unistyles';

interface Props {
  visible: boolean;
  initialName?: string;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (name: string) => Promise<void>;
}

export default function CreateLinkModal({
  visible,
  initialName = '',
  loading,
  onClose,
  onSubmit,
}: Props) {
  const [name, setName] = useState(initialName);
  const [localLoading, setLocalLoading] = useState(false);

  const isEditMode = initialName !== '';

  useEffect(() => {
    if (visible) {
      setName(initialName);
    }
  }, [visible, initialName]);

  const handleSubmit = async () => {
    if (!name.trim()) return;
    setLocalLoading(true);
    try {
      await onSubmit(name.trim());
      if (!isEditMode) {
        setName('');
      }
    } finally {
      setLocalLoading(false);
    }
  };

  const handleClose = () => {
    if (isEditMode) {
      setName(initialName);
    } else {
      setName('');
    }
    onClose();
  };

  const hasChanges = name.trim() !== initialName;

  return (
    <Modal visible={visible} onClose={handleClose} animationType="slide">
      <View style={styles.header}>
        <Text style={styles.title}>
          {isEditMode ? 'Edit Link Name' : 'Start a Link'}
        </Text>
        <Pressable onPress={handleClose}>
          <View style={styles.closeButton}>
            <Text style={styles.closeText}>Close</Text>
          </View>
        </Pressable>
      </View>

      <TextField
        header="Link Name"
        value={name}
        onChangeText={setName}
        placeholder="e.g. Beach Day, Birthday Party"
        autoCapitalize="words"
        maxLength={50}
        returnKeyType="done"
      />

      <View style={styles.submitWrap}>
        <Button
          title={isEditMode ? 'Save Changes' : 'Start Link'}
          size="lg"
          onPress={handleSubmit}
          loading={loading || localLoading}
          disabled={!name.trim() || (isEditMode && !hasChanges)}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create((theme) => ({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: theme.fontSizes.lg,
    fontWeight: theme.fontWeights.semibold,
    color: theme.colors.textPrimary,
  },
  closeButton: {
    padding: theme.spacing.sm,
  },
  closeText: {
    color: theme.colors.textTertiary,
  },
  submitWrap: {
    marginTop: theme.spacing['2xl'],
  },
}));
