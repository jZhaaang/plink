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
  profiles: async (userId, resourceId, action) => {
    if (action === 'read') {
      // allow any user to read
      return true;
    } else {
      // allow user to write/read
      return userId === resourceId;
    }
  },

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
      const { data: linkOwner } = await supabase
        .from('links')
        .select('id')
        .eq('id', resourceId)
        .eq('owner_id', userId)
        .single();

      if (linkOwner) return true;

      if (action === 'delete') {
        // allow party owner to delete links
        const { data: link } = await supabase
          .from('links')
          .select('party_id')
          .eq('id', resourceId)
          .single();

        if (!link) return false;

        const { data: party } = await supabase
          .from('parties')
          .select('id')
          .eq('id', link.party_id)
          .eq('owner_id', userId)
          .single();

        return !!party;
      }

      return false;
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

function parseKey(key: string[]): ParsedKey | null {
  if (key[0] === 'profiles' && key[1]) {
    return { resource: 'profiles', resourceId: key[1] };
  }

  // parties/{partyId}/banner
  if (key[0] === 'parties' && key[1]) {
    return { resource: 'parties', resourceId: key[1] };
  }

  // links/{linkId}/
  if (key[0] === 'links' && key[1] && !key[2]) {
    return { resource: 'links', resourceId: key[1] };
  }

  // links/{linkId}/banner
  if (key[0] === 'links' && key[1] && key[2] === 'banner') {
    return { resource: 'links', resourceId: key[1] };
  }

  // links/{linkId}/posts/{postId}/{mediaId}.ext
  if (key[0] === 'links' && key[1] && key[2] === 'posts' && key[3]) {
    return { resource: 'link-media', resourceId: key[3], parentId: key[1] };
  }

  return null;
}

export function requireAccess(action: 'read' | 'write' | 'delete') {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) => {
    const rawKey: string | string[] | undefined =
      req.params.key ?? req.body?.key;
    const userId = req.userId;

    if (!rawKey || !userId) {
      res.status(400).json({ error: 'Invalid request' });
      return;
    }

    const key: string[] = Array.isArray(rawKey) ? rawKey : rawKey.split('/');

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

export function requireLinkAccess() {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) => {
    const { linkId } = req.body;
    const userId = req.userId;

    if (!linkId || !userId) {
      res.status(400).json({ error: 'linkId is required' });
      return;
    }

    try {
      const { data: link } = await supabase
        .from('links')
        .select('party_id')
        .eq('id', linkId)
        .single();

      if (!link) {
        res.status(403).json({ error: 'Access denied' });
        return;
      }

      const { data: member } = await supabase
        .from('party_members')
        .select('user_id')
        .eq('party_id', link.party_id)
        .eq('user_id', userId)
        .single();

      if (!member) {
        res.status(403).json({ error: 'Access denied' });
        return;
      }

      next();
    } catch (err) {
      console.error(
        JSON.stringify({
          timestamp: new Date().toISOString(),
          event: 'batch_link_authorization_failed',
          userId,
          linkId,
          reason: err instanceof Error ? err.message : 'Unknown error',
        }),
      );
      res.status(500).json({ error: 'Authorization check failed' });
    }
  };
}
