import { Feather } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

type Props = {
  onPress: () => void;
};

export function CreatePartyCard({ onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      className="mr-4 w-32 items-center justify-center rounded-xl bg-white border border-gray-200 shadow-sm py-4"
    >
      <View className="w-14 h-14 rounded-full bg-blue-100 items-center justify-center mb-2">
        <Feather name="plus-square" size={24} color="blue" />
      </View>
      <Text className="text-sm font-medium text-gray-800 text-center">Create a Party</Text>
    </Pressable>
  );
}
