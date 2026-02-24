import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native-unistyles';
import { Button, EmptyState } from '.';

interface DataFallbackScreenProps {
  title?: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function DataFallbackScreen({
  title = 'Unable to load content',
  message = 'Please try again.',
  actionLabel = 'Retry',
  onAction,
}: DataFallbackScreenProps) {
  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <EmptyState
        icon="alert-circle"
        title={title}
        message={message}
        style={styles.emptyState}
        action={
          onAction ? <Button title={actionLabel} onPress={onAction} /> : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create((theme) => ({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing['2xl'],
  },
}));
