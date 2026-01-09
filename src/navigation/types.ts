import type { NavigatorScreenParams } from '@react-navigation/native';

export type AuthStackParamList = {
  Landing: undefined;
  SignIn: undefined;
  SignUp: undefined;
  CompleteProfile: undefined;
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
};

export type TabsParamList = {
  Home: undefined;
  Party: NavigatorScreenParams<PartyStackParamList>;
};

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  SignedIn: {
    screen?: keyof SignedInParamList;
    params?: NavigatorScreenParams<SignedInParamList>['params'];
    needsProfile: boolean;
  };
};
