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
import { links as linksStorage } from '../../../lib/media-service/links';
import { compressImage } from '../../../lib/media/compress';
import { getErrorMessage } from '../../../lib/utils/errorExtraction';
import { trackEvent } from '../../../lib/telemetry/analytics';
import { logger } from '../../../lib/telemetry/logger';
import { LinkDetail, LinkPostWithMedia } from '../../../lib/models';
import { deleteBulk } from '../../../lib/media-service/client';
import { StagedLocation } from '../components/LocationPicker';
import { upsertLinkLocations } from '../../../lib/supabase/queries/linkLocations';

type UseLinkDetailActionsParams = {
  linkId: string;
  partyId: string;
  linkDetail: LinkDetail | null;
  posts: LinkPostWithMedia[];
  onDelete?: () => void;
  onLeave?: () => void;
};

export function useLinkDetailActions({
  linkId,
  partyId,
  linkDetail,
  posts,
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
      invalidate.onLinkChanged(linkId, partyId);
      Burnt.toast({ title: 'Link ended', preset: 'done', haptic: 'success' });
    } catch (err) {
      logger.error('Error ending link', { err });
      await dialog.error('Failed to End Link', getErrorMessage(err));
    }
  }, [linkId, partyId, dialog, invalidate]);

  const editLink = useCallback(
    async ({
      name,
      bannerUri,
      locations,
    }: {
      name: string;
      bannerUri: string | null;
      locations: StagedLocation[];
    }) => {
      setSavingBanner(!!bannerUri);
      try {
        const nameChanged = name !== linkDetail?.name;
        const bannerChanged = !!bannerUri;
        const locationsChanged =
          locations.length !== linkDetail?.locations.length ||
          locations.some(
            (location, i) =>
              location.mapbox_id !== linkDetail?.locations[i]?.mapbox_id,
          );

        await Promise.all([
          nameChanged ? updateLinkById(linkId, { name }) : Promise.resolve(),
          bannerChanged
            ? (async () => {
                const compressed = await compressImage(bannerUri);
                const bannerPath = await linksStorage.upload(
                  linkId,
                  { type: 'banner' },
                  compressed.uri,
                  'image/jpeg',
                );
                await updateLinkById(linkId, { banner_path: bannerPath });
              })()
            : Promise.resolve(),
          locationsChanged
            ? upsertLinkLocations(linkId, locations)
            : Promise.resolve(),
        ]);
        trackEvent('link_updated', { link_id: linkId });
        invalidate.onLinkChanged(linkId, partyId);
        Burnt.toast({
          title: 'Link updated',
          preset: 'done',
          haptic: 'success',
        });
      } catch (err) {
        logger.error('Error updating link', { err });
        await dialog.error('Failed to Update Link', getErrorMessage(err));
      } finally {
        setSavingBanner(false);
      }
    },
    [linkId, partyId, linkDetail, dialog, invalidate],
  );

  const deleteLinkAction = useCallback(async () => {
    if (!linkDetail) return;

    const confirmed = await dialog.confirmTypedDanger(
      'Delete Link?',
      'This will permanently delete the link and all its media. This cannot be undone.',
      linkDetail.name,
    );
    if (!confirmed) return;

    try {
      await deleteBulk(`links/${linkId}`);
      await deleteLink(linkId);
      trackEvent('link_deleted', { link_id: linkId });
      trackEvent('link_post_deleted', {
        link_id: linkId,
        posts_count: posts.length,
      });
      trackEvent('media_deleted', {
        link_id: linkId,
      });
      invalidate.onLinkChanged(linkId, partyId);
      Burnt.toast({ title: 'Link deleted', preset: 'done', haptic: 'success' });
      onDelete?.();
    } catch (err) {
      logger.error('Error deleting link', { err });
      await dialog.error('Failed to Delete Link', getErrorMessage(err));
    }
  }, [linkId, partyId, linkDetail, dialog, invalidate, onDelete]);

  const joinLink = useCallback(async () => {
    const confirmed = await dialog.confirmAsk(
      'Join Link?',
      'Become an active participant in the ongoing link.',
    );
    if (!confirmed) return;

    try {
      await createLinkMember({ link_id: linkId, user_id: userId });
      trackEvent('link_joined', { link_id: linkId });
      invalidate.onLinkChanged(linkId, partyId);
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
      invalidate.onLinkChanged(linkId, partyId);
      Burnt.toast({ title: 'Left link', preset: 'done', haptic: 'success' });
      onLeave?.();
    } catch (err) {
      logger.error('Error leaving link', { err });
      await dialog.error('Failed to Leave Link', getErrorMessage(err));
    }
  }, [linkId, partyId, userId, dialog, invalidate, onLeave]);

  const deletePost = useCallback(
    async (postId: string) => {
      if (!linkDetail) return;
      const post = posts.find((p) => p.id === postId);
      if (!post) return;

      const confirmed = await dialog.confirmDanger(
        'Delete Post?',
        `This will permanently delete this post and ${post.media.length} media.`,
      );
      if (!confirmed) return;

      try {
        const allMedia = posts.flatMap((p) => p.media);
        const deletedPaths = new Set(post.media.map((m) => m.path));
        const isDeletingBanner =
          !!linkDetail.banner_path && deletedPaths.has(linkDetail.banner_path);
        const nextImageBanner = isDeletingBanner
          ? allMedia.find(
              (m) => m.type === 'image' && !deletedPaths.has(m.path),
            )
          : null;

        await linksStorage.remove(
          post.media.flatMap((m) => [m.path, m.thumbnail_path]),
        );
        await Promise.all(post.media.map((m) => deleteLinkPostMedia(m.id)));
        await deleteLinkPost(postId);

        if (isDeletingBanner) {
          await updateLinkById(linkId, {
            banner_path: nextImageBanner?.path ?? null,
            banner_crop_x: 50,
            banner_crop_y: 42,
          });
        }

        invalidate.onLinkChanged(linkId, partyId);
        Burnt.toast({
          title: 'Post deleted',
          preset: 'done',
          haptic: 'success',
        });
      } catch (err) {
        logger.error('Error deleting post', { err });
        await dialog.error('Failed to Delete Post', getErrorMessage(err));
      }
    },
    [linkId, linkDetail, dialog, invalidate],
  );

  return {
    endLink: endLinkAction,
    editLink,
    savingBanner,
    deleteLink: deleteLinkAction,
    joinLink,
    leaveLink,
    deletePost,
  };
}
