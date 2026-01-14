import { Feather } from '@expo/vector-icons';
import { ComponentProps } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';

type DropdownMenuProps = {
  visible: boolean;
  onClose: () => void;
  anchor: { x: number; y: number } | null;
  children: React.ReactNode;
};

type DropdownMenuItemProps = {
  icon: ComponentProps<typeof Feather>['name'];
  label: string;
  onPress: () => void;
  variant?: 'default' | 'danger';
};

export function DropdownMenuItem({
  icon,
  label,
  onPress,
  variant = 'default',
}: DropdownMenuItemProps) {
  const isDanger = variant === 'danger';

  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center px-4 py-3 active:bg-slate-100"
    >
      <Feather name={icon} size={18} color={isDanger ? '#dc2626' : '#475569'} />
      <Text
        className={`ml-3 text-base ${isDanger ? 'text-red-600' : 'text-slate-700'}`}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export default function DropdownMenu({
  visible,
  onClose,
  anchor,
  children,
}: DropdownMenuProps) {
  if (!anchor) return null;

  return (
    <Modal visible={visible} transparent onRequestClose={onClose}>
      <Pressable className="flex-1" onPress={onClose}>
        <View
          style={{
            position: 'absolute',
            top: anchor.y,
            right: 12,
          }}
          className="bg-white rounded-lg shadow-lg overflow-hidden min-w-[200px] border border-slate-200"
        >
          <Pressable onPress={(e) => e.stopPropagation()}>{children}</Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}
