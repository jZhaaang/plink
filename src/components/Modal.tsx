import React from 'react';
import {
  Modal as RNModal,
  Pressable,
  ModalProps,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { cn } from './cn';
import { SafeAreaView } from 'react-native-safe-area-context';

type Props = {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  animationType?: ModalProps['animationType'];
  contentClassName?: string;
  backdropClassName?: string;
  disableBackdropDismiss?: boolean;
  scrollEnabled?: boolean;
};

export default function Modal({
  visible,
  onClose,
  children,
  animationType = 'fade',
  contentClassName,
  backdropClassName,
  disableBackdropDismiss = false,
  scrollEnabled = true,
  ...rest
}: Props) {
  return (
    <RNModal
      visible={visible}
      transparent
      animationType={animationType}
      statusBarTranslucent
      onRequestClose={onClose}
      {...rest}
    >
      <Pressable
        onPress={disableBackdropDismiss ? undefined : onClose}
        className={cn(
          'flex-1 items-center justify-center bg-black/50',
          backdropClassName,
        )}
      >
        <KeyboardAvoidingView
          behavior={Platform.select({ ios: 'padding', android: 'padding' })}
          className="w-full items-center"
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            className={cn('w-[88%] rounded-2xl bg-white p-5', contentClassName)}
          >
            <SafeAreaView edges={['bottom', 'left', 'right']}>
              <ScrollView
                scrollEnabled={scrollEnabled}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                contentContainerClassName="flex-grow-1"
              >
                {children}
              </ScrollView>
            </SafeAreaView>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </RNModal>
  );
}
