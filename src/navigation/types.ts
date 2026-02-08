import type { NavigatorScreenParams } from '@react-navigation/native';

export type AuthStackParamList = {
  Landing: undefined;
  SignIn: undefined;
  SignUp: undefined;
};

export type SignedInParamList = {
  App: NavigatorScreenParams<TabsParamList>;
  CompleteProfile: undefined;
};

export type PartyStackParamList = {
  PartyList: undefined;
  PartyDetail: { partyId: string };
  LinkDetail: { linkId: string; partyId: string };
  MediaViewer: { mediaUrls: string[]; initialIndex: number };
  AllMedia: { linkId: string };
};

export type TabsParamList = {
  Home: undefined;
  Party: NavigatorScreenParams<PartyStackParamList>;
  Profile: undefined;
};

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  SignedIn: {
    screen?: keyof SignedInParamList;
    params?: NavigatorScreenParams<SignedInParamList>['params'];
    needsProfile: boolean;
  };
};
