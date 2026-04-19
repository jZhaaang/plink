import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../queryKeys';
import { useAuth } from '../../../providers/AuthProvider';

export function useInvalidate() {
  const queryClient = useQueryClient();
  const { userId } = useAuth();

  const base = {
    homeFeed: () => {
      if (userId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.home.feed(userId),
        });
      }
    },

    homeActiveLinks: () => {
      if (userId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.home.activeLinks(userId),
        });
      }
    },

    parties: () => {
      if (userId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.parties.list(userId),
        });
      }
    },

    partyDetail: (partyId: string) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.parties.detail(partyId),
      });
    },

    pastLinks: (partyId: string) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.parties.pastLinks(partyId),
      });
    },

    linkDetail: (linkId: string) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.links.detail(linkId),
      });
    },

    linkLocations: (linkId: string) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.links.locations(linkId),
      });
    },

    linkLocationMedia: (linkId: string, locationId: string) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.links.locationMedia(linkId, locationId),
      });
    },

    allLinkLocationMedia: (linkId: string) => {
      queryClient.invalidateQueries({
        queryKey: ['links', 'locationMedia', linkId],
      });
    },

    activeLink: () => {
      if (userId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.links.active(userId),
        });
      }
    },

    activity: () => {
      if (userId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.activity.feed(userId),
        });
      }
    },

    profile: () => {
      if (userId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.profile.detail(userId),
        });
      }
    },

    all: () => {
      queryClient.invalidateQueries();
    },
  };

  return {
    ...base,

    onLinkChanged: (linkId: string, partyId: string) => {
      base.linkDetail(linkId);
      base.linkLocations(linkId);
      base.allLinkLocationMedia(linkId);
      base.partyDetail(partyId);
      base.pastLinks(partyId);
      base.homeFeed();
      base.homeActiveLinks();
      base.activeLink();
      base.activity();
    },

    onLinkLocationsChanged: (linkId: string) => {
      base.linkLocations(linkId);
    },

    onLinkDeleted: (linkId: string, partyId: string) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.links.detail(linkId),
        refetchType: 'none',
      });
      base.partyDetail(partyId);
      base.pastLinks(partyId);
      base.homeFeed();
      base.homeActiveLinks();
      base.activeLink();
      base.activity();
    },

    onPartyChanged: (partyId: string) => {
      base.parties();
      base.partyDetail(partyId);
      base.pastLinks(partyId);
      base.homeFeed();
      base.homeActiveLinks();
      base.activeLink();
      base.activity();
    },

    onPartyDeleted: (partyId: string) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.parties.detail(partyId),
        refetchType: 'none',
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.parties.pastLinks(partyId),
        refetchType: 'none',
      });
      base.parties();
      base.homeFeed();
      base.homeActiveLinks();
      base.activeLink();
      base.activity();
    },
  };
}
