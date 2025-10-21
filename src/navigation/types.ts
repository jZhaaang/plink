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

export type TabsParamList = {
  Home: undefined;
  PartyList: undefined;
};

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  SignedIn: {
    screen?: keyof SignedInParamList;
    params?: NavigatorScreenParams<SignedInParamList>['params'];
    needsProfile: boolean;
  };
};
