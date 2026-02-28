import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './authenticate';
import { supabase } from '../lib/supabase';

type Action = 'read' | 'write' | 'delete';

interface ParsedKey {
  resource: string;
  resourceId: string;
  parentId?: string;
}

type AccessChecker = (
  userId: string,
  resourceId: string,
  action: Action,
  parentId?: string,
) => Promise<boolean>;

const accessCheckers: Record<string, AccessChecker> = {
  parties: async (userId, resourceId, action) => {
    if (action === 'read') {
      // allow party members to read
      const { data } = await supabase
        .from('party_members')
        .select('user_id')
        .eq('party_id', resourceId)
        .eq('user_id', userId)
        .single();

      return !!data;
    } else {
      // allow party owner to write/delete
      const { data } = await supabase
        .from('parties')
        .select('id')
        .eq('id', resourceId)
        .eq('owner_id', userId)
        .single();

      return !!data;
    }
  },

  links: async (userId, resourceId, action) => {
    if (action === 'read') {
      // allow party members to read
      const { data: link } = await supabase
        .from('links')
        .select('party_id')
        .eq('id', resourceId)
        .single();

      if (!link) return false;

      const { data } = await supabase
        .from('party_members')
        .select('user_id')
        .eq('party_id', link.party_id)
        .eq('user_id', userId)
        .single();

      return !!data;
    } else {
      // allow link owner to write/delete
      const { data } = await supabase
        .from('links')
        .select('id')
        .eq('id', resourceId)
        .eq('owner_id', userId)
        .single();

      return !!data;
    }
  },

  'link-media': async (userId, resourceId, action, parentId) => {
    if (!parentId) return false;

    if (action === 'delete') {
      // allow post owner to delete
      const { data } = await supabase
        .from('link_posts')
        .select('id')
        .eq('id', resourceId)
        .eq('owner_id', userId)
        .single();

      return !!data;
    } else if (action === 'write') {
      // allow link members to write
      const { data } = await supabase
        .from('link_members')
        .select('user_id')
        .eq('link_id', parentId)
        .eq('user_id', userId)
        .single();

      return !!data;
    } else {
      // allow party members to read
      const { data: link } = await supabase
        .from('links')
        .select('party_id')
        .eq('id', parentId)
        .single();

      if (!link) return false;

      const { data } = await supabase
        .from('party_members')
        .select('user_id')
        .eq('party_id', link.party_id)
        .eq('user_id', userId)
        .single();

      return !!data;
    }
  },
};

function parseKey(key: string): ParsedKey | null {
  const parts = key.split('/');

  // parties/{partyId}/banner.jpg
  if (parts[0] === 'parties' && parts[1]) {
    return { resource: 'parties', resourceId: parts[1] };
  }

  // links/{linkId}/banner.jpg
  if (parts[0] === 'links' && parts[1] && parts[2] === 'banner.jpg') {
    return { resource: 'links', resourceId: parts[1] };
  }

  // links/{linkId}/posts/{postId}/{mediaId}.ext
  if (parts[0] === 'links' && parts[1] && parts[2] === 'posts' && parts[3]) {
    return { resource: 'link-media', resourceId: parts[3], parentId: parts[1] };
  }

  return null;
}

export function requireAccess(action: 'read' | 'write' | 'delete') {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) => {
    const key = req.body.key || req.params.key;
    const userId = req.userId;

    if (!key || !userId) {
      res.status(400).json({ error: 'Invalid request' });
      return;
    }

    const parsed = parseKey(key);
    if (!parsed) {
      res.status(400).json({ error: 'Invalid key' });
      return;
    }

    const checker = accessCheckers[parsed.resource];
    if (!checker) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    try {
      const hasAccess = await checker(
        userId,
        parsed.resourceId,
        action,
        parsed.parentId,
      );

      if (!hasAccess) {
        console.warn(
          JSON.stringify({
            timestamp: new Date().toISOString(),
            event: 'access_denied',
            userId,
            resource: parsed.resource,
            resourceId: parsed.resourceId,
            action,
          }),
        );
        res.status(403).json({ error: 'Access denied' });
        return;
      }

      next();
    } catch (err) {
      console.error(
        JSON.stringify({
          timestamp: new Date().toISOString(),
          event: 'authorization_failed',
          userId,
          resource: parsed.resource,
          resourceId: parsed.resourceId,
          reason: err instanceof Error ? err.message : 'Unknown error',
        }),
      );
      res.status(500).json({ error: 'Authorization check failed' });
    }
  };
}
