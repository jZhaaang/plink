import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { DialogProvider } from './src/providers/DialogProvider';
import { AuthProvider } from './src/providers/AuthProvider';
import * as Sentry from '@sentry/react-native';
import { initMonitoring } from './src/lib/telemetry/monitoring';
import { ErrorBoundary } from './src/components/ErrorBoundary';

initMonitoring();

export default Sentry.wrap(function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ErrorBoundary>
          <DialogProvider>
            <AuthProvider>
              <AppNavigator />
            </AuthProvider>
          </DialogProvider>
        </ErrorBoundary>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
});
