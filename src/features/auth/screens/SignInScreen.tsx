import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../../navigation/types';
import { Button, TextField } from '../../../components';
import { signInWithEmail } from '../../../lib/supabase/queries/auth';
import { useDialog } from '../../../providers/DialogProvider';

type Props = NativeStackScreenProps<AuthStackParamList, 'SignIn'>;

export default function SignInScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secure, setSecure] = useState(true);
  const [loading, setLoading] = useState(false);
  const dialog = useDialog();

  async function onSignIn() {
    if (!email || !password) {
      await dialog.error('Missing info', 'Enter your email and password');
      if (__DEV__) {
        await signInWithEmail('jimmy.zhaang@gmail.com', 'testing');
        return;
      }
      return;
    }
    setLoading(true);
    const { error } = await signInWithEmail(email.trim(), password);
    setLoading(false);
    if (error) {
      await dialog.error('Login failed', 'Check your email and password');
    }
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-white">
      <View className="flex-1 gap-8 px-6">
        <View className="pt-2">
          <Text className="text-2xl font-extrabold tracking-tight text-slate-900">
            plink
          </Text>
        </View>

        <View className="gap-2">
          <Text className="text-3xl font-bold text-slate-900">
            Welcome back
          </Text>
          <Text className="text-slate-600">Log in to continue</Text>
        </View>

        <View className="mt-2 gap-4">
          <View className="gap-1">
            <Text className="text-xs font-medium text-slate-600">Email</Text>
            <TextField
              left={<Ionicons name="mail-outline" size={18} color="#64748b" />}
              placeholder="you@example.com"
              keyboardType="email-address"
              textContentType="emailAddress"
              value={email}
              onChangeText={setEmail}
              returnKeyType="next"
            />
          </View>

          <View className="gap-1">
            <Text className="text-xs font-medium text-slate-600">Password</Text>
            <TextField
              left={
                <Ionicons
                  name="lock-closed-outline"
                  size={18}
                  color="#64748b"
                />
              }
              placeholder="Password"
              secureTextEntry={secure}
              textContentType="newPassword"
              value={password}
              onChangeText={setPassword}
              returnKeyType="done"
              onSubmitEditing={onSignIn}
              right={
                <Pressable hitSlop={8} onPress={() => setSecure((s) => !s)}>
                  <Ionicons
                    name={secure ? 'eye-off-outline' : 'eye-outline'}
                    size={18}
                    color="#64748b"
                  />
                </Pressable>
              }
            />
          </View>

          <Button
            title="Log In"
            size="lg"
            disabled={loading}
            onPress={onSignIn}
          />
        </View>

        <View className="mt-auto mb-6 flex-row justify-center gap-1">
          <Text className="text-slate-600">No account?</Text>
          <Pressable onPress={() => navigation.navigate('SignUp')}>
            <Text className="font-semibold text-slate-900">Create one</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
