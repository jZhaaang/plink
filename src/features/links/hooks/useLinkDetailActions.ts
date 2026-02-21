import { useCallback, useState } from 'react';
import * as Burnt from 'burnt';
import { useDialog } from '../../../providers/DialogProvider';
import { useInvalidate } from '../../../lib/supabase/hooks/useInvalidate';
import { useAuth } from '../../../providers/AuthProvider';
import {
  endLink,
  deleteLink,
  updateLinkById,
} from '../../../lib/supabase/queries/links';
import {
  createLinkMember,
  deleteLinkMember,
} from '../../../lib/supabase/queries/linkMembers';
import { deleteLinkPostMedia } from '../../../lib/supabase/queries/linkPostMedia';
import { deleteLinkPost } from '../../../lib/supabase/queries/linkPosts';
import { links as linksStorage } from '../../../lib/supabase/storage/links';
import { compressImage } from '../../../lib/media/compress';
import { getErrorMessage } from '../../../lib/utils/errorExtraction';
import { trackEvent } from '../../../lib/telemetry/analytics';
import { logger } from '../../../lib/telemetry/logger';
import { LinkDetail } from '../../../lib/models';

type UseLinkDetailActionsParams = {
  linkId: string;
  partyId: string;
  link: LinkDetail | null;
  onDelete?: () => void;
  onLeave?: () => void;
};

export function useLinkDetailActions({
  linkId,
  partyId,
  link,
  onDelete,
  onLeave,
}: UseLinkDetailActionsParams) {
  const { userId } = useAuth();
  const dialog = useDialog();
  const invalidate = useInvalidate();
  const [savingBanner, setSavingBanner] = useState(false);

  const endLinkAction = useCallback(async () => {
    const confirmed = await dialog.confirmDanger(
      'End Link?',
      'This will end the link. Members can still view media but cannot add more.',
    );
    if (!confirmed) return;

    try {
      await endLink(linkId);
      trackEvent('link_ended', { link_id: linkId });
      invalidate.linkDetail(linkId);
      invalidate.activeLink();
      invalidate.partyDetail(partyId);
      invalidate.activity();
      Burnt.toast({ title: 'Link ended', preset: 'done', haptic: 'success' });
    } catch (err) {
      logger.error('Error ending link', { err });
      await dialog.error('Failed to End Link', getErrorMessage(err));
    }
  }, [linkId, partyId, dialog, invalidate]);

  const editName = useCallback(
    async (newName: string) => {
      try {
        await updateLinkById(linkId, { name: newName });
        trackEvent('link_updated', { link_id: linkId });
        invalidate.linkDetail(linkId);
        invalidate.activeLink();
        invalidate.partyDetail(partyId);
        invalidate.activity();
        Burnt.toast({ title: 'Link renamed', preset: 'done', haptic: 'success' });
      } catch (err) {
        logger.error('Error updating link name', { err });
        await dialog.error('Failed to Edit Link Name', getErrorMessage(err));
      }
    },
    [linkId, partyId, dialog, invalidate],
  );

  const saveBanner = useCallback(
    async (croppedUri: string) => {
      setSavingBanner(true);
      try {
        const compressed = await compressImage(croppedUri);
        const bannerPath = await linksStorage.uploadBanner(
          linkId,
          compressed.uri,
          'image/jpeg',
        );
        await updateLinkById(linkId, {
          banner_path: bannerPath,
          banner_crop_x: 50,
          banner_crop_y: 42,
        });
        invalidate.linkDetail(linkId);
        invalidate.activeLink();
        invalidate.partyDetail(partyId);
        Burnt.toast({ title: 'Banner updated', preset: 'done', haptic: 'success' });
      } catch (err) {
        logger.error('Error updating link banner', { err });
        await dialog.error('Failed to Update Banner', getErrorMessage(err));
      } finally {
        setSavingBanner(false);
      }
    },
    [linkId, partyId, dialog, invalidate],
  );

  const deleteLinkAction = useCallback(async () => {
    if (!link) return;

    const confirmed = await dialog.confirmDanger(
      'Delete Link?',
      'This will permanently delete the link and all its media. This cannot be undone.',
    );
    if (!confirmed) return;

    try {
      const linkPaths = await linksStorage.getPathsById(linkId);
      await linksStorage.remove(linkPaths);
      await deleteLink(linkId);
      trackEvent('link_deleted', { link_id: linkId });
      trackEvent('link_post_deleted', {
        link_id: linkId,
        posts_count: link.posts.length,
      });
      trackEvent('media_deleted', {
        link_id: linkId,
        media_count: linkPaths.length,
      });
      invalidate.activeLink();
      invalidate.partyDetail(partyId);
      invalidate.activity();
      Burnt.toast({ title: 'Link deleted', preset: 'done', haptic: 'success' });
      onDelete?.();
    } catch (err) {
      logger.error('Error deleting link', { err });
      await dialog.error('Failed to Delete Link', getErrorMessage(err));
    }
  }, [linkId, partyId, link, dialog, invalidate, onDelete]);

  const joinLink = useCallback(async () => {
    const confirmed = await dialog.confirmAsk(
      'Join Link?',
      'Become an active participant in the ongoing link.',
    );
    if (!confirmed) return;

    try {
      await createLinkMember({ link_id: linkId, user_id: userId });
      trackEvent('link_joined', { link_id: linkId });
      invalidate.linkDetail(linkId);
      invalidate.activeLink();
      Burnt.toast({ title: 'Joined link', preset: 'done', haptic: 'success' });
    } catch (err) {
      logger.error('Error joining link', { err });
      await dialog.error('Failed to Join Link', getErrorMessage(err));
    }
  }, [linkId, userId, dialog, invalidate]);

  const leaveLink = useCallback(async () => {
    const confirmed = await dialog.confirmDanger(
      'Leave Link?',
      'You will no longer be able to view or add media to this link.',
    );
    if (!confirmed) return;
    if (!userId) return;

    try {
      await deleteLinkMember(linkId, userId);
      trackEvent('link_left', { linkId: linkId });
      invalidate.linkDetail(linkId);
      invalidate.activeLink();
      invalidate.partyDetail(partyId);
      Burnt.toast({ title: 'Left link', preset: 'done', haptic: 'success' });
      onLeave?.();
    } catch (err) {
      logger.error('Error leaving link', { err });
      await dialog.error('Failed to Leave Link', getErrorMessage(err));
    }
  }, [linkId, partyId, userId, dialog, invalidate, onLeave]);

  const deletePost = useCallback(
    async (postId: string) => {
      if (!link) return;
      const post = link.posts.find((p) => p.id === postId);
      if (!post) return;

      const confirmed = await dialog.confirmDanger(
        'Delete Post?',
        `This will permanently delete this post and ${post.media.length} media.`,
      );
      if (!confirmed) return;

      try {
        const allMedia = link.posts.flatMap((p) => p.media);
        const deletedPaths = new Set(post.media.map((m) => m.path));
        const isDeletingBanner =
          !!link.banner_path && deletedPaths.has(link.banner_path);
        const nextImageBanner = isDeletingBanner
          ? allMedia.find(
              (m) => m.type === 'image' && !deletedPaths.has(m.path),
            )
          : null;

        await Promise.all(post.media.map((m) => deleteLinkPostMedia(m.id)));
        await deleteLinkPost(postId);
        await linksStorage.remove(post.media.map((m) => m.path));

        if (isDeletingBanner) {
          await updateLinkById(linkId, {
            banner_path: nextImageBanner?.path ?? null,
            banner_crop_x: 50,
            banner_crop_y: 42,
          });
        }

        invalidate.linkDetail(linkId);
        Burnt.toast({ title: 'Post deleted', preset: 'done', haptic: 'success' });
      } catch (err) {
        logger.error('Error deleting post', { err });
        await dialog.error('Failed to Delete Post', getErrorMessage(err));
      }
    },
    [linkId, link, dialog, invalidate],
  );

  return {
    endLink: endLinkAction,
    editName,
    saveBanner,
    savingBanner,
    deleteLink: deleteLinkAction,
    joinLink,
    leaveLink,
    deletePost,
  };
}
