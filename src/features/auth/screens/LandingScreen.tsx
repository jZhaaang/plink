import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../../navigation/types';
import { Button } from '../../../components';
import { StyleSheet } from 'react-native-unistyles';

type Props = NativeStackScreenProps<AuthStackParamList, 'Landing'>;

export default function LandingScreen({ navigation }: Props) {
  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.logo}>plink</Text>
      </View>

      <View style={styles.hero}>
        <View style={styles.heroImage} />

        <View style={styles.heroTextGroup}>
          <Text style={styles.heroTitle}>
            Share moments with your groups
          </Text>
          <Text style={styles.heroSubtitle}>
            Start a link, invite friends, and capture memories—live.
          </Text>
        </View>
      </View>

      <View style={styles.actions}>
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

const styles = StyleSheet.create((theme) => ({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  header: {
    paddingHorizontal: theme.spacing['2xl'],
    paddingTop: theme.spacing.sm,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logo: {
    fontSize: theme.fontSizes['2xl'],
    fontWeight: theme.fontWeights.extrabold,
    letterSpacing: -0.6,
    color: theme.colors.textPrimary,
  },
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing['3xl'],
    gap: theme.spacing['2xl'],
  },
  heroImage: {
    height: 160,
    width: 160,
    borderRadius: theme.radii.xl,
    overflow: 'hidden',
    ...theme.shadows.md,
  },
  heroTextGroup: {
    gap: theme.spacing.sm,
  },
  heroTitle: {
    textAlign: 'center',
    fontSize: theme.fontSizes['3xl'],
    fontWeight: theme.fontWeights.bold,
    lineHeight: 36,
    color: theme.colors.textPrimary,
  },
  heroSubtitle: {
    textAlign: 'center',
    fontSize: theme.fontSizes.base,
    color: theme.colors.iconSecondary,
  },
  actions: {
    paddingHorizontal: theme.spacing['2xl'],
    paddingBottom: theme.spacing['3xl'],
    gap: theme.spacing.md,
  },
}));
