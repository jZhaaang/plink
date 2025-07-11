import { LinkPostWithUrls, LinkPostWithUser } from '@/types/models';
import { useEffect, useState } from 'react';
import { resolveSignedUrlsForPosts } from '../utils/resolveSignedUrlsForPosts';
import { useUserId } from './useUserId';

export function useResolvedPostsWithUrls(posts: LinkPostWithUser[]) {
  const { userId, loading: userLoading } = useUserId();
  const [resolvedPosts, setResolvedPosts] = useState<LinkPostWithUrls[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userId || userLoading) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const resolved = await resolveSignedUrlsForPosts(posts);
        setResolvedPosts(resolved);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [posts, userId, userLoading]);

  return { resolvedPosts, loading, error };
}
