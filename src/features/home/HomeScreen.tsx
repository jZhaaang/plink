import { View, Text } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

export default function HomeScreen() {
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
