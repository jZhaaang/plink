import { supabase } from '@/lib/supabase/queries/';
import Button from '@/ui/components/Button';
import Container from '@/ui/components/Container';
import Input from '@/ui/components/Input';
import { useState } from 'react';
import { Text } from 'react-native';

export default function AuthScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSignUp = async () => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: 'plink://complete-profile' },
    });
    setMessage(error ? error.message : 'Check your email to confirm');
  };

  const handleSignIn = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setMessage(error.message);
    }
  };

  return (
    <Container>
      <Text className="text-lg font-semibold m-4 text-center">Enter your email and password</Text>
      <Input
        placeholder="Email"
        onChangeText={setEmail}
        keyboardType="email-address"
        className="mb-4"
      />
      <Input placeholder="Password" onChangeText={setPassword} secureTextEntry className="mb-4" />

      <Button title="Sign Up" onPress={handleSignUp} />
      <Button title="Sign In" intent="secondary" onPress={handleSignIn} />

      {!!message && <Text className="text-center text-sm text-red-500 mt-2">{message}</Text>}
    </Container>
  );
}
