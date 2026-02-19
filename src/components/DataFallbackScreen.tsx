import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, EmptyState } from '.';

type Props = {
  title?: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
};

export default function DataFallbackScreen({
  title = 'Unable to load content',
  message = 'Please try again.',
  actionLabel = 'Retry',
  onAction,
}: Props) {
  return (
    <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-neutral-50">
      <EmptyState
        icon="alert-circle"
        title={title}
        message={message}
        className="flex-1 justify-center px-6"
        action={
          onAction ? <Button title={actionLabel} onPress={onAction} /> : null
        }
      />
    </SafeAreaView>
  );
}
