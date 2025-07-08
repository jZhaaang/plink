import type { Link, LinkMemberWithUser, LinkPostWithUser, Party } from '@/types/models';
import { useCallback, useEffect, useState } from 'react';
import { getLinkById, getLinkMembers, getLinkPosts, getPartyById } from '../';

export function useLinkDetail(partyId: string, linkId: string) {
  const [party, setParty] = useState<Party | null>(null);
  const [link, setLink] = useState<Link | null>(null);
  const [members, setMembers] = useState<LinkMemberWithUser[]>([]);
  const [posts, setPosts] = useState<LinkPostWithUser[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!partyId || !linkId) return;
    setLoading(true);
    try {
      const [partyRes, linkRes, membersRes, postsRes] = await Promise.all([
        getPartyById(partyId),
        getLinkById(linkId),
        getLinkMembers(linkId),
        getLinkPosts(linkId),
      ]);

      if (partyRes.error) throw partyRes.error;
      if (linkRes.error) throw linkRes.error;
      if (membersRes.error) throw membersRes.error;
      if (postsRes.error) throw postsRes.error;

      setParty(partyRes.data ?? null);
      setLink(linkRes.data ?? null);
      setMembers(membersRes.data ?? []);
      setPosts(postsRes.data ?? []);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [partyId, linkId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { party, link, members, posts, loading, error, refetch: fetchData };
}
