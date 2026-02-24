import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, Pressable, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../../navigation/types';
import { Button, TextField } from '../../../components';
import { signInWithEmail } from '../../../lib/supabase/queries/auth';
import { useDialog } from '../../../providers/DialogProvider';
import { normalize } from '../../../lib/utils/validation';
import { logger } from '../../../lib/telemetry/logger';
import { getErrorMessage } from '../../../lib/utils/errorExtraction';
import { StyleSheet } from 'react-native-unistyles';

type Props = NativeStackScreenProps<AuthStackParamList, 'SignIn'>;

export default function SignInScreen({ navigation }: Props) {
  const dialog = useDialog();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secure, setSecure] = useState(true);

  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    if (loading) return;

    const normalizedEmail = normalize(email);
    if (!normalizedEmail || !password) {
      if (__DEV__ && Platform.OS === 'android') {
        await signInWithEmail('jimmy.zhaang@gmail.com', 'testing');
        return;
      } else if (__DEV__ && Platform.OS === 'ios') {
        await signInWithEmail('isniffcookies@gmail.com', 'popcorn');
        return;
      }
      await dialog.error('Missing info', 'Enter your email and password.');
      return;
    }

    setLoading(true);
    try {
      await signInWithEmail(normalizedEmail, password);
    } catch (err) {
      logger.error('Error signing in with email:', { err });
      await dialog.error('Sign In Failed', getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.logoWrap}>
          <Text style={styles.logo}>plink</Text>
        </View>

        <View style={styles.headingGroup}>
          <Text style={styles.heading}>Welcome back</Text>
          <Text style={styles.subheading}>Log in to continue</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Email</Text>
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

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Password</Text>
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
              textContentType="password"
              value={password}
              onChangeText={setPassword}
              returnKeyType="done"
              onSubmitEditing={handleSignIn}
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
            loading={loading}
            disabled={loading}
            onPress={handleSignIn}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>No account?</Text>
          <Pressable onPress={() => navigation.navigate('SignUp')}>
            <Text style={styles.footerLink}>Create one</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create((theme) => ({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  container: {
    flex: 1,
    gap: theme.spacing['3xl'],
    paddingHorizontal: theme.spacing['2xl'],
  },
  logoWrap: {
    paddingTop: theme.spacing.sm,
  },
  logo: {
    fontSize: theme.fontSizes['2xl'],
    fontWeight: theme.fontWeights.extrabold,
    letterSpacing: -0.6,
    color: theme.colors.textPrimary,
  },
  headingGroup: {
    gap: theme.spacing.sm,
  },
  heading: {
    fontSize: theme.fontSizes['3xl'],
    fontWeight: theme.fontWeights.bold,
    color: theme.colors.textPrimary,
  },
  subheading: {
    color: theme.colors.iconSecondary,
  },
  form: {
    marginTop: theme.spacing.sm,
    gap: theme.spacing.lg,
  },
  fieldGroup: {
    gap: theme.spacing.xs,
  },
  fieldLabel: {
    fontSize: theme.fontSizes.xs,
    fontWeight: theme.fontWeights.medium,
    color: theme.colors.iconSecondary,
  },
  footer: {
    marginTop: 'auto',
    marginBottom: theme.spacing['2xl'],
    flexDirection: 'row',
    justifyContent: 'center',
    gap: theme.spacing.xs,
  },
  footerText: {
    color: theme.colors.iconSecondary,
  },
  footerLink: {
    fontWeight: theme.fontWeights.semibold,
    color: theme.colors.textPrimary,
  },
}));
