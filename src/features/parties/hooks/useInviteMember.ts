import { useCallback, useState } from 'react';
import { Profile } from '../../../lib/models';
import { searchUserByUsername } from '../../../lib/supabase/queries/users';
import { createPartyMember } from '../../../lib/supabase/queries/partyMembers';
import { trackEvent } from '../../../lib/telemetry/analytics';

type InviteState =
  | { status: 'idle' }
  | { status: 'searching' }
  | { status: 'found'; user: Profile }
  | { status: 'not_found' }
  | { status: 'already_member' }
  | { status: 'error'; message: string };

type InviteAction = 'idle' | 'inviting' | 'invited';

export function useInviteMember(partyId: string, existingMemberIds: string[]) {
  const [state, setState] = useState<InviteState>({ status: 'idle' });
  const [inviteAction, setInviteAction] = useState<InviteAction>('idle');

  const searchUser = useCallback(
    async (username: string) => {
      setState({ status: 'searching' });
      setInviteAction('idle');

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
      setInviteAction('inviting');

      try {
        await createPartyMember({ party_id: partyId, user_id: userId });
        trackEvent('party_joined', { party_id: partyId, user_id: userId });
        setInviteAction('invited');
      } catch (err) {
        setInviteAction('idle');
        setState({ status: 'error', message: `Failed to invite user, ${err}` });
      }
    },
    [partyId],
  );

  const reset = useCallback(() => {
    setState({ status: 'idle' });
    setInviteAction('idle');
  }, []);

  return { state, inviteAction, searchUser, inviteUser, reset };
}
