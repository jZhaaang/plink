import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet } from 'react-native-unistyles';
import Button from './Button';
import Modal from './Modal';

export type DialogVariant = 'error' | 'success' | 'info';

export interface DialogProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  variant?: DialogVariant;
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
  primaryLabel = 'OK',
  onPrimary,
  secondaryLabel,
  onSecondary,
}: DialogProps) {
  return (
    <Modal visible={visible} onClose={onClose}>
      <View style={styles.body}>
        <Ionicons
          name={variantIcon[variant]}
          size={32}
          color={variantColour[variant]}
        />
        {title ? <Text style={styles.title}>{title}</Text> : null}
        {message ? <Text style={styles.message}>{message}</Text> : null}
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
          style={{ flex: 1 }}
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
}));
