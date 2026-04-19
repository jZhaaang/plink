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
import { links as linksStorage } from '../../../lib/media-service/links';
import { compressImage } from '../../../lib/media/compress';
import { getErrorMessage } from '../../../lib/utils/errorExtraction';
import { trackEvent } from '../../../lib/telemetry/analytics';
import { logger } from '../../../lib/telemetry/logger';
import { LinkDetail, LinkMedia } from '../../../lib/models';
import { deleteBulk } from '../../../lib/media-service/client';
import { StagedLocation } from '../components/LocationPicker';
import { upsertLinkLocations } from '../../../lib/supabase/queries/linkLocations';
import { deleteLinkMedia } from '../../../lib/supabase/queries/linkMedia';

type UseLinkDetailActionsParams = {
  linkId: string;
  partyId: string;
  linkDetail: LinkDetail | null;
  onDelete?: () => void;
  onLeave?: () => void;
};

export function useLinkDetailActions({
  linkId,
  partyId,
  linkDetail,
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
        media_count: linkDetail?.mediaCount ?? 0,
      });
      trackEvent('media_deleted', {
        link_id: linkId,
      });
      invalidate.onLinkDeleted(linkId, partyId);
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

  const deleteMedia = useCallback(
    async (media: LinkMedia) => {
      const confirmed = await dialog.confirmDanger(
        'Delete?',
        'Remove this item.',
      );
      if (!confirmed) return;

      try {
        const paths = [media.path, media.thumbnail_path].filter(Boolean);
        await linksStorage.remove(paths);
        await deleteLinkMedia(media.id);

        invalidate.onLinkChanged(linkId, partyId);
        Burnt.toast({
          title: 'Item deleted',
          preset: 'done',
          haptic: 'success',
        });
      } catch (err) {
        logger.error('Error deleting media', { err });
        await dialog.error('Failed to Item ', getErrorMessage(err));
      }
    },
    [linkId, dialog, invalidate],
  );

  return {
    endLink: endLinkAction,
    editLink,
    savingBanner,
    deleteLink: deleteLinkAction,
    joinLink,
    leaveLink,
    deleteMedia,
  };
}
