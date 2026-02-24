import React from 'react';
import {
  Modal as RNModal,
  Pressable,
  ModalProps,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
  ViewStyle,
} from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ModalComponentProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  animationType?: ModalProps['animationType'];
  contentStyle?: ViewStyle;
  backdropStyle?: ViewStyle;
  disableBackdropDismiss?: boolean;
  scrollEnabled?: boolean;
}

export default function Modal({
  visible,
  onClose,
  children,
  animationType = 'fade',
  contentStyle,
  backdropStyle,
  disableBackdropDismiss = false,
  scrollEnabled = true,
  ...rest
}: ModalComponentProps) {
  return (
    <RNModal
      visible={visible}
      transparent
      animationType={animationType}
      statusBarTranslucent
      onRequestClose={onClose}
      {...rest}
    >
      <View style={[styles.backdrop, backdropStyle]}>
        <Pressable
          onPress={disableBackdropDismiss ? undefined : onClose}
          style={StyleSheet.absoluteFill}
        />
        <KeyboardAvoidingView
          behavior={Platform.select({ ios: 'padding', android: 'padding' })}
          style={styles.keyboardView}
        >
          <Pressable onPress={(e) => e.stopPropagation()}>
            <View style={[styles.content, contentStyle]}>
              <SafeAreaView edges={['bottom', 'left', 'right']}>
                <ScrollView
                  scrollEnabled={scrollEnabled}
                  keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.scrollContent}
                >
                  {children}
                </ScrollView>
              </SafeAreaView>
            </View>
          </Pressable>
        </KeyboardAvoidingView>
      </View>
    </RNModal>
  );
}

const styles = StyleSheet.create((theme) => ({
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.overlay,
  },
  keyboardView: {
    width: '100%',
    alignItems: 'center',
  },
  content: {
    width: '88%',
    borderRadius: theme.radii.xl,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.xl,
  },
  scrollContent: {
    flexGrow: 1,
  },
}));
