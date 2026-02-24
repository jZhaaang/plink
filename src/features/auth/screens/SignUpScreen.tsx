import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../../navigation/types';
import { Button, TextField } from '../../../components';
import { signUpWithEmail } from '../../../lib/supabase/queries/auth';
import { useDialog } from '../../../providers/DialogProvider';
import { isValidEmail, normalize } from '../../../lib/utils/validation';
import { trackEvent } from '../../../lib/telemetry/analytics';
import { getErrorMessage } from '../../../lib/utils/errorExtraction';
import { logger } from '../../../lib/telemetry/logger';
import { StyleSheet } from 'react-native-unistyles';

type Props = NativeStackScreenProps<AuthStackParamList, 'SignUp'>;

export default function SignUpScreen({ navigation }: Props) {
  const dialog = useDialog();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [secure, setSecure] = useState(true);

  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (loading) return;

    const normalizedEmail = normalize(email);
    if (!isValidEmail(normalizedEmail)) {
      await dialog.error('Invalid Form', 'Enter a valid email.');
      return;
    } else if (password.length < 6) {
      await dialog.error(
        'Invalid Form',
        'Password must be at least 6 characters long',
      );
      return;
    } else if (password !== confirmPassword) {
      await dialog.error('Invalid Form', 'Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      await signUpWithEmail(normalizedEmail.trim(), password);
      trackEvent('sign_up_completed');
    } catch (err) {
      logger.error('Error signing up with email:', { err });
      await dialog.error('Sign Up Failed', getErrorMessage(err));
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
          <Text style={styles.heading}>Create your account</Text>
          <Text style={styles.subheading}>
            Join and start sharing memories
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Email</Text>
            <TextField
              left={<Ionicons name="mail-outline" size={18} color="#64748b" />}
              placeholder="you@example.com"
              keyboardType="email-address"
              textContentType="emailAddress"
              autoCapitalize="none"
              autoCorrect={false}
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
            <Text style={styles.hint}>Minimum 6 characters</Text>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Confirm</Text>
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
              onSubmitEditing={handleSignUp}
            />
          </View>

          <Button
            title="Create Account"
            size="lg"
            disabled={loading}
            onPress={handleSignUp}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account?</Text>
          <Pressable onPress={() => navigation.navigate('SignIn')}>
            <Text style={styles.footerLink}>Log in</Text>
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
  hint: {
    paddingLeft: theme.spacing.xs,
    fontSize: 11,
    color: theme.colors.textTertiary,
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
