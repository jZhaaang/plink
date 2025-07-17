import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BottomTabNavigator from './BottomTabNavigator';

import AuthScreen from '@/screens/auth/AuthScreen';
import CompleteProfileScreen from '@/screens/auth/CompleteProfileScreen';
import CreateLinkScreen from '@/screens/link/CreateLinkScreen';
import LinkDetailScreen from '@/screens/link/LinkDetailScreen';
import CreatePartyScreen from '@/screens/party/CreatePartyScreen';
import PartyDetailScreen from '@/screens/party/PartyDetailScreen';
import PartyListScreen from '@/screens/party/PartyListScreen';
import ProfileScreen from '@/screens/settings/ProfileScreen';

export type RootStackParamList = {
  CompleteProfile: undefined;
  Home: undefined;
  Main: undefined;
  Auth: undefined;
  CreateLink: { partyId: string };
  LinkDetail: { partyId: string; linkId: string };
  CreateParty: undefined;
  PartyList: undefined;
  PartyDetail: { partyId: string };
  Profile: undefined;
};

type Props = {
  isAuthenticated: boolean;
  needsProfile: boolean;
  onProfileComplete: () => void;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator({ isAuthenticated, needsProfile, onProfileComplete }: Props) {
  return (
    <Stack.Navigator>
      {!isAuthenticated ? (
        <Stack.Screen name="Auth" component={AuthScreen} />
      ) : needsProfile ? (
        <Stack.Screen name="CompleteProfile">
          {() => <CompleteProfileScreen onComplete={onProfileComplete} />}
        </Stack.Screen>
      ) : (
        <>
          <Stack.Screen
            name="Main"
            component={BottomTabNavigator}
            options={{ headerShown: false }}
          />
          <Stack.Screen name="CreateLink" component={CreateLinkScreen} />
          <Stack.Screen name="LinkDetail" component={LinkDetailScreen} />
          <Stack.Screen name="CreateParty" component={CreatePartyScreen} />
          <Stack.Screen name="PartyList" component={PartyListScreen} />
          <Stack.Screen name="PartyDetail" component={PartyDetailScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}
