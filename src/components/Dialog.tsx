import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import Button from './Button';
import Modal from './Modal';
import TextField from './TextField';

export type DialogVariant = 'error' | 'success' | 'info';

export interface DialogProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  variant?: DialogVariant;
  confirmText?: string;
  confirmPlaceholder?: string;
  primaryLabel?: string;
  onPrimary?: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
}

const variantIcon: Record<DialogVariant, keyof typeof Ionicons.glyphMap> = {
  error: 'alert-circle',
  success: 'checkmark-circle',
  info: 'information-circle',
};

const variantColour: Record<DialogVariant, string> = {
  error: '#ef4444',
  success: '#10b981',
  info: '#3b82f6',
};

export default function Dialog({
  visible,
  onClose,
  title,
  message,
  variant,
  confirmText,
  confirmPlaceholder,
  primaryLabel = 'OK',
  onPrimary,
  secondaryLabel,
  onSecondary,
}: DialogProps) {
  const { theme } = useUnistyles();
  const [typedValue, setTypedValue] = useState('');

  useEffect(() => {
    if (visible) setTypedValue('');
  }, [visible]);

  const requiresTyping = !!confirmText;
  const isConfirmed = !requiresTyping || typedValue === confirmText;

  return (
    <Modal visible={visible} onClose={onClose}>
      <View style={styles.body}>
        <Ionicons
          name={variantIcon[variant]}
          size={theme.iconSizes.xl}
          color={variantColour[variant]}
        />
        {title ? <Text style={styles.title}>{title}</Text> : null}
        {message ? <Text style={styles.message}>{message}</Text> : null}

        {requiresTyping && (
          <View style={styles.confirmInput}>
            <Text style={styles.confirmHint}>
              Type <Text style={styles.confirmBold}>{confirmText}</Text> to
              confirm
            </Text>
            <TextField
              value={typedValue}
              onChangeText={setTypedValue}
              placeholder={confirmPlaceholder ?? confirmText}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        )}
      </View>

      <View style={styles.actions}>
        {secondaryLabel ? (
          <Button
            title={secondaryLabel}
            onPress={onSecondary ?? onClose}
            variant="outline"
            style={{ flex: 1 }}
          />
        ) : null}
        <Button
          title={primaryLabel}
          onPress={onPrimary ?? onClose}
          disabled={!isConfirmed}
          style={{ flex: 1, opacity: isConfirmed ? 1 : 0.5 }}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create((theme) => ({
  body: {
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  title: {
    fontSize: theme.fontSizes.lg,
    fontWeight: theme.fontWeights.semibold,
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
  message: {
    textAlign: 'center',
    color: theme.colors.iconSecondary,
  },
  actions: {
    marginTop: theme.spacing.xl,
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  confirmInput: {
    width: '100%',
    gap: theme.spacing.sm,
  },
  confirmHint: {
    textAlign: 'center',
    color: theme.colors.iconSecondary,
    fontSize: theme.fontSizes.sm,
  },
  confirmBold: {
    fontWeight: theme.fontWeights.semibold,
    color: theme.colors.textPrimary,
  },
}));
