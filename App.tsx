import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import './global.css';
import AppNavigator from './src/navigation/AppNavigator';
import { DialogProvider } from './src/providers/DialogProvider';
import { AuthProvider } from './src/providers/AuthProvider';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <DialogProvider>
          <AuthProvider>
            <AppNavigator />
          </AuthProvider>
        </DialogProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
