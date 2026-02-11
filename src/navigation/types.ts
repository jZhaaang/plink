import type { NavigatorScreenParams } from '@react-navigation/native';
import { LinkPostMedia } from '../lib/models';

export type AuthStackParamList = {
  Landing: undefined;
  SignIn: undefined;
  SignUp: undefined;
};

export type SignedInParamList = {
  App: NavigatorScreenParams<TabsParamList>;
  CompleteProfile: undefined;
};

export type LinkFlowParamList = {
  LinkDetail: { linkId: string; partyId: string };
  MediaViewer: { mediaItems: LinkPostMedia[]; initialIndex: number };
  AllMedia: { linkId: string };
};

export type PartyStackParamList = {
  PartyList: undefined;
  PartyDetail: { partyId: string };
} & LinkFlowParamList;

export type LinkStackParamList = LinkFlowParamList;

export type TabsParamList = {
  Home: undefined;
  Party: NavigatorScreenParams<PartyStackParamList>;
  Link: NavigatorScreenParams<LinkStackParamList>;
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
