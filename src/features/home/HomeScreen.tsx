import { View, Text } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import { useAuth } from '../../providers/AuthProvider';
import { useEffect } from 'react';

export default function HomeScreen() {
  const { session } = useAuth();

  useEffect(() => {
    console.log(session?.access_token);
  }, [session]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>HomeTest</Text>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
  },
  title: {
    fontSize: theme.fontSizes.xl,
    fontWeight: theme.fontWeights.semibold,
    color: theme.colors.textPrimary,
  },
}));
