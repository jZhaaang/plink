import { useCallback, useState } from 'react';
import { Profile } from '../../../lib/models';
import { searchUserByUsername } from '../../../lib/supabase/queries/users';
import { createPartyMember } from '../../../lib/supabase/queries/partyMembers';

type InviteState =
  | { status: 'idle' }
  | { status: 'searching' }
  | { status: 'found'; user: Profile }
  | { status: 'not_found' }
  | { status: 'already_member' }
  | { status: 'inviting' }
  | { status: 'success' }
  | { status: 'error'; message: string };

export function useInviteMember(partyId: string, existingMemberIds: string[]) {
  const [state, setState] = useState<InviteState>({ status: 'idle' });

  const searchUser = useCallback(
    async (username: string) => {
      setState({ status: 'searching' });

      try {
        const user = await searchUserByUsername(username);

        if (!user) {
          setState({ status: 'not_found' });
          return;
        }

        if (existingMemberIds.includes(user.id)) {
          setState({ status: 'already_member' });
          return;
        }

        setState({ status: 'found', user });
      } catch (err) {
        setState({
          status: 'error',
          message: `Failed to search for user, ${err}`,
        });
      }
    },
    [existingMemberIds],
  );

  const inviteUser = useCallback(
    async (userId: string) => {
      setState({ status: 'inviting' });

      try {
        await createPartyMember({ party_id: partyId, user_id: userId });
        setState({ status: 'success' });
      } catch (err) {
        setState({ status: 'error', message: `Failed to invite user, ${err}` });
      }
    },
    [partyId],
  );

  const reset = useCallback(() => {
    setState({ status: 'idle' });
  }, []);

  return { state, searchUser, inviteUser, reset };
}
