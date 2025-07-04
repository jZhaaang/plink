import { createNativeStackNavigator } from '@react-navigation/native-stack';

import AuthScreen from '@/screens/auth/AuthScreen';
import HomeScreen from '@/screens/home/HomeScreen';
import CreateLinkScreen from '@/screens/link/CreateLinkScreen';
import LinkDetailScreen from '@/screens/link/LinkDetailScreen';
import CreatePartyScreen from '@/screens/party/CreatePartyScreen';
import PartyDetailScreen from '@/screens/party/PartyDetailScreen';
import PartyListScreen from '@/screens/party/PartyListScreen';
import ProfileScreen from '@/screens/settings/ProfileScreen';

export type RootStackParamList = {
  Home: undefined;
  Auth: undefined;
  CreateLink: { partyId: string };
  LinkDetail: { partyId: string; linkId: string };
  CreateParty: undefined;
  PartyList: undefined;
  PartyDetail: { partyId: string };
  Profile: undefined;
};

type Props = {
  isAuthenticated: boolean | null;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator({ isAuthenticated }: Props) {
  return (
    <Stack.Navigator>
      {isAuthenticated ? (
        <>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="CreateLink" component={CreateLinkScreen} />
          <Stack.Screen name="LinkDetail" component={LinkDetailScreen} />
          <Stack.Screen name="CreateParty" component={CreatePartyScreen} />
          <Stack.Screen name="PartyList" component={PartyListScreen} />
          <Stack.Screen name="PartyDetail" component={PartyDetailScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
        </>
      ) : (
        <Stack.Screen name="Auth" component={AuthScreen} />
      )}
    </Stack.Navigator>
  );
}
