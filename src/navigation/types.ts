import type { NavigatorScreenParams } from '@react-navigation/native';

export type AuthStackParamList = {
  Landing: undefined;
  SignIn: undefined;
  SignUp: undefined;
  CompleteProfile: undefined;
};

export type PartiesStackParamList = {
  Parties: undefined;
  PartyDetail: { partyId: string };
};

export type TabsParamList = {
  Home: undefined;
  Parties: NavigatorScreenParams<PartiesStackParamList>;
  CreateLink: undefined;
  Notifications: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  App: NavigatorScreenParams<TabsParamList>;
};
