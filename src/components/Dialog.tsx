import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Button from './Button';
import Modal from './Modal';

export type DialogVariant = 'error' | 'success' | 'info';

export type DialogProps = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  variant?: DialogVariant;
  primaryLabel?: string;
  onPrimary?: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
};

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
  ...rest
}: DialogProps) {
  return (
    <Modal visible={visible} onClose={onClose} {...rest}>
      <View className="items-center gap-3">
        <Ionicons
          name={variantIcon[variant]}
          size={32}
          color={variantColour[variant]}
        />
        {title ? (
          <Text className="text-lg font-semibold text-slate-900 text-center">
            {title}
          </Text>
        ) : null}
        {message ? (
          <Text className="text-center text-slate-600">{message}</Text>
        ) : null}
      </View>

      <View className="mt-5 flex-row gap-3">
        {secondaryLabel ? (
          <Button
            title={secondaryLabel}
            onPress={onSecondary ?? onClose}
            variant="outline"
            className="flex-1"
          />
        ) : null}
        <Button
          title={primaryLabel}
          onPress={onPrimary ?? onClose}
          className="flex-1"
        />
      </View>
    </Modal>
  );
}
