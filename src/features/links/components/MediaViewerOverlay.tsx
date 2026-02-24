import { View, Text, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet } from 'react-native-unistyles';

interface Props {
  currentIndex: number;
  totalCount: number;
  onClose: () => void;
}

export default function MediaViewerOverlay({
  currentIndex,
  totalCount,
  onClose,
}: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View
      pointerEvents="box-none"
      style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 }}
    >
      <LinearGradient
        colors={['rgba(0,0,0,0.5)', 'transparent']}
        pointerEvents="box-none"
        style={{
          paddingTop: insets.top + 8,
          paddingBottom: 24,
          paddingHorizontal: 16,
        }}
      >
        <View style={styles.row}>
          <Pressable onPress={onClose}>
            <View style={styles.closeButton}>
              <Feather name="x" size={24} color="white" />
            </View>
          </Pressable>
          <Text style={styles.counter}>
            {currentIndex + 1} of {totalCount}
          </Text>
          <View style={styles.spacer} />
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  closeButton: {
    padding: theme.spacing.sm,
    marginLeft: -theme.spacing.sm,
    borderRadius: theme.radii.full,
  },
  counter: {
    color: theme.colors.textInverse,
    fontWeight: theme.fontWeights.medium,
  },
  spacer: {
    width: 40,
  },
}));
