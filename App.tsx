import { SafeAreaProvider } from 'react-native-safe-area-context';
import './global.css';
import AppNavigator from './src/navigation/AppNavigator';
import { DialogProvider } from './src/providers/DialogProvider';

export default function App() {
  return (
    <SafeAreaProvider>
      <DialogProvider>
        <AppNavigator />
      </DialogProvider>
    </SafeAreaProvider>
  );
}
