import { NavigationContainer } from '@react-navigation/native';
import Tabs from './Tabs';

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tabs />
    </NavigationContainer>
  );
}
