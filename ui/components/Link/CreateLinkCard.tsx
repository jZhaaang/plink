import { Feather } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

type Props = {
  onPress: () => void;
};

export function CreateLinkCard({ onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      className="mx-4 my-2 p-4 items-center justify-center rounded-xl bg-white border border-gray-200"
    >
      <View className="w-16 h-16 rounded-full bg-green-100 items-center justify-center mb-2">
        <Feather name="plus-square" size={28} color="green" />
      </View>
      <Text className="text-md font-medium text-gray-800 text-center">Start a Link</Text>
    </Pressable>
  );
}
