import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../../navigation/types';
import { Button, TextField } from '../../../components';
import { signUpWithEmail } from '../../../lib/supabase/queries/auth';
import { useDialog } from '../../../providers/DialogProvider';

type Props = NativeStackScreenProps<AuthStackParamList, 'SignUp'>;

export default function SignUpScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [secure, setSecure] = useState(true);
  const [loading, setLoading] = useState(false);
  const dialog = useDialog();

  const valid =
    /\S+@\S+\.\S+/.test(email.trim()) &&
    password.length >= 6 &&
    password === confirmPassword;

  async function onSignUp() {
    if (!valid) {
      await dialog.error(
        'Sign up failed',
        'Enter a valid email, a 6+ char password, and make sure they match',
      );
      return;
    }
    setLoading(true);
    const { error } = await signUpWithEmail(email.trim(), password);
    setLoading(false);

    if (error) {
      await dialog.error('Sign up failed', error.message);
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
            Create your account
          </Text>
          <Text className="text-slate-600">
            Join and start sharing memories
          </Text>
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
              returnKeyType="next"
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
            <Text className="pl-1 text-[11px] text-slate-500">
              Minimum 6 characters
            </Text>
          </View>

          <View className="gap-1">
            <Text className="text-xs font-medium text-slate-600">Confirm</Text>
            <TextField
              left={
                <Ionicons
                  name="shield-checkmark-outline"
                  size={18}
                  color="#64748b"
                />
              }
              placeholder="Confirm"
              secureTextEntry={secure}
              textContentType="newPassword"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              returnKeyType="done"
              onSubmitEditing={onSignUp}
            />
          </View>

          <Button
            title="Create Account"
            size="lg"
            disabled={loading}
            onPress={onSignUp}
          />
        </View>

        <View className="mt-auto mb-6 flex-row justify-center gap-1">
          <Text className="text-slate-600">Already have an account?</Text>
          <Pressable onPress={() => navigation.navigate('SignIn')}>
            <Text className="font-semibold text-slate-900">Log in</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
