export const getNavLinkingConfig = () => ({
  prefixes: ['plink://'],

  config: {
    screens: {
      Auth: 'auth',
      CompleteProfile: 'complete-profile',
      Home: 'home',
      CreateLink: 'create-link/:partyId',
      LinkDetail: 'link/:partyId/:linkId',
      CreateParty: 'create-party',
      PartyList: 'party-list',
      PartyDetail: 'party/:partyId',
      Profile: 'profile',
    },
  },
});
