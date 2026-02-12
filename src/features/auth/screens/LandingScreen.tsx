import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../../navigation/types';
import { Button } from '../../../components';

type Props = NativeStackScreenProps<AuthStackParamList, 'Landing'>;

export default function LandingScreen({ navigation }: Props) {
  return (
    <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-white">
      <View className="px-6 pt-2 items-center justify-between">
        <Text className="text-2xl font-extrabold tracking-tight text-slate-900">
          plink
        </Text>
      </View>

      <View className="flex-1 items-center justify-center px-8 gap-6">
        <View className="h-40 w-40 rounded-3xl overflow-hidden shadow-md"></View>

        <View className="gap-2">
          <Text className="text-center text-3xl font-bold leading-tight text-slate-900">
            Share moments with your groups
          </Text>
          <Text className="text-center text-base text-slate-600">
            Start a link, invite friends, and capture memories—live.
          </Text>
        </View>
      </View>

      <View className="px-6 pb-8 gap-3">
        <Button
          title="Create Account"
          size="lg"
          onPress={() => navigation.navigate('SignUp')}
        />

        <Button
          title="Log In"
          variant="outline"
          size="lg"
          onPress={() => navigation.navigate('SignIn')}
        />
      </View>
    </SafeAreaView>
  );
}
