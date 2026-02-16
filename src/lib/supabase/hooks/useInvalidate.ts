import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../queryKeys';
import { useAuth } from '../../../providers/AuthProvider';

export function useInvalidate() {
  const queryClient = useQueryClient();
  const { userId } = useAuth();

  return {
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

    linkDetail: (linkId: string) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.links.detail(linkId),
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
}
