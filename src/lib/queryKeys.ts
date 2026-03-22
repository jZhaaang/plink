export const queryKeys = {
  home: {
    feed: (userId: string) => ['home', 'feed', userId] as const,
    activeLinks: (userId: string) => ['home', 'active', userId] as const,
  },
  parties: {
    list: (userId: string) => ['parties', 'list', userId] as const,
    detail: (partyId: string) => ['parties', 'detail', partyId] as const,
  },
  links: {
    detail: (linkId: string) => ['links', 'detail', linkId] as const,
    active: (userId: string) => ['links', 'active', userId] as const,
  },
  activity: {
    feed: (userId: string) => ['activity', 'feed', userId] as const,
  },
  profile: {
    detail: (userId: string) => ['profile', userId] as const,
  },
};
