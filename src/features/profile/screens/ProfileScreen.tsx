import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  return (
    <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-neutral-50">
      <View className="flex-1 items-center justify-center">
        <Text className="text-2xl font-bold text-slate-900">
          Profile Screen
        </Text>
      </View>
    </SafeAreaView>
  );
}
