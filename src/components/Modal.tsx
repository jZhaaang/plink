import React from 'react';
import { Modal as RNModal, Pressable, ModalProps } from 'react-native';

type Props = {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  animationType?: ModalProps['animationType'];
};

export default function Modal({
  visible,
  onClose,
  children,
  animationType = 'fade',
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
        onPress={onClose}
        className="flex-1 items-center justify-center bg-black/50"
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          className="w-[88%] rounded-2xl bg-white p-5"
        >
          {children}
        </Pressable>
      </Pressable>
    </RNModal>
  );
}
