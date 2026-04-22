import { Feather } from '@expo/vector-icons';
import { ComponentProps, useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface DropdownMenuProps {
  visible: boolean;
  onClose: () => void;
  anchor: { x: number; y: number } | null;
  items: DropdownMenuItemProps[];
}

export interface DropdownMenuItemProps {
  icon: ComponentProps<typeof Feather>['name'];
  label: string;
  onPress: () => void;
  variant?: 'default' | 'danger';
}

export function DropdownMenuItem({
  icon,
  label,
  onPress,
  variant = 'default',
}: DropdownMenuItemProps) {
  const { theme } = useUnistyles();

  const [pressed, setPressed] = useState(false);
  const isDanger = variant === 'danger';

  menuItemStyles.useVariants({ pressed, isDanger });

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
    >
      <View style={menuItemStyles.row}>
        <Feather
          name={icon}
          size={18}
          color={isDanger ? theme.colors.errorDark : theme.colors.iconSecondary}
        />
        <Text style={menuItemStyles.label}>{label}</Text>
      </View>
    </Pressable>
  );
}

const menuItemStyles = StyleSheet.create((theme) => ({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    variants: {
      pressed: {
        true: { backgroundColor: theme.colors.surfacePressed },
        false: {},
      },
    },
  },
  label: {
    marginLeft: theme.spacing.sm,
    fontSize: theme.fontSizes.sm,
    variants: {
      isDanger: {
        true: { color: theme.colors.errorDark },
        false: { color: theme.colors.textSecondary },
      },
    },
  },
}));

export default function DropdownMenu({
  visible,
  onClose,
  anchor,
  items,
}: DropdownMenuProps) {
  if (!anchor) return null;

  const wrappedItems = items.map((item) => ({
    ...item,
    onPress: () => {
      onClose();
      item.onPress();
    },
  }));

  return (
    <Modal visible={visible} transparent onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={styles.menu(anchor.y)}>
          <Pressable onPress={(e) => e.stopPropagation()}>
            {wrappedItems.map((item) => (
              <DropdownMenuItem key={item.label} {...item} />
            ))}
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create((theme) => ({
  overlay: {
    flex: 1,
  },
  menu: (yAnchor: number) => ({
    position: 'absolute',
    top: yAnchor,
    right: 12,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.md,
    overflow: 'hidden',
    minWidth: 180,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.lg,
  }),
}));
