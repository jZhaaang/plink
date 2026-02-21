import { View, Text, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

type Props = {
  currentIndex: number;
  totalCount: number;
  onClose: () => void;
};

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
        <View className="flex-row items-center justify-between">
          <Pressable onPress={onClose} className="p-2 -ml-2 rounded-full">
            <Feather name="x" size={24} color="white" />
          </Pressable>
          <Text className="text-white font-medium">
            {currentIndex + 1} of {totalCount}
          </Text>
          <View className="w-10" />
        </View>
      </LinearGradient>
    </View>
  );
}
