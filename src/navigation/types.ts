import type { NavigatorScreenParams } from '@react-navigation/native';

export type AuthStackParamList = {
  Landing: undefined;
  SignIn: undefined;
  SignUp: undefined;
};

export type SignedInParamList = {
  App: NavigatorScreenParams<TabsParamList>;
  CompleteProfile: undefined;
  MediaViewer: { linkId: string; initialMediaId: string };
  AllMedia: { linkId: string };
};

export type HomeStackParamList = {
  HomeFeed: undefined;
  LinkDetail: { linkId: string; partyId: string };
};

export type PartyStackParamList = {
  PartyList: undefined;
  PartyDetail: { partyId: string };
  LinkDetail: { linkId: string; partyId: string };
};

export type LinkStackParamList = {
  LinkDetail: { linkId: string; partyId: string };
};

export type ActivityStackParamList = {
  Activity: undefined;
};

export type ProfileStackParamList = {
  Profile: undefined;
};

export type TabsParamList = {
  Home: NavigatorScreenParams<HomeStackParamList>;
  Party: NavigatorScreenParams<PartyStackParamList>;
  Link: NavigatorScreenParams<LinkStackParamList>;
  Activity: NavigatorScreenParams<ActivityStackParamList>;
  Profile: NavigatorScreenParams<ProfileStackParamList>;
};

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  SignedIn: {
    screen?: keyof SignedInParamList;
    params?: NavigatorScreenParams<SignedInParamList>['params'];
    needsProfile: boolean;
  };
};
