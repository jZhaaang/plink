import * as Burnt from 'burnt';
import { useCallback } from 'react';
import { useInvalidate } from '../../../lib/supabase/hooks/useInvalidate';
import { useDialog } from '../../../providers/DialogProvider';
import {
  confirmLinkLocation,
  deleteLinkLocation,
  updateLinkLocation,
  upsertLinkLocations,
} from '../../../lib/supabase/queries/linkLocations';
import { logger } from '../../../lib/telemetry/logger';
import { LinkLocationUpdate } from '../../../lib/models';
import { getErrorMessage } from '../../../lib/utils/errorExtraction';

interface UseLinkLocationsActionsParams {
  linkId: string;
  partyId: string;
}

export function useLinkLocationsActions({
  linkId,
  partyId,
}: UseLinkLocationsActionsParams) {
  const dialog = useDialog();
  const invalidate = useInvalidate();

  const confirmLocation = useCallback(
    async (locationId: string) => {
      try {
        await confirmLinkLocation(locationId);
        invalidate.linkLocations(linkId);
        Burnt.toast({
          title: 'Location confirmed',
          preset: 'done',
          haptic: 'success',
        });
      } catch (err) {
        logger.error('Error confirming link location', { err });
        await dialog.error('Failed to Confirm Location', getErrorMessage(err));
      }
    },
    [linkId, partyId, dialog, invalidate],
  );

  const editLocation = useCallback(
    async (locationId: string, location: LinkLocationUpdate) => {
      if (!location) return;

      try {
        await updateLinkLocation(locationId, location);
        invalidate.linkLocations(linkId);
        Burnt.toast({
          title: 'Location updated',
          preset: 'done',
          haptic: 'success',
        });
      } catch (err) {
        logger.error('Error updating location', { err });
        await dialog.error('Failed to Edit Location', getErrorMessage(err));
      }
    },
    [linkId, partyId, dialog, invalidate],
  );

  const editLocations = useCallback(
    async (locations: LinkLocationUpdate[]) => {
      try {
        await upsertLinkLocations(linkId, locations);
        invalidate.linkLocations(linkId);
        Burnt.toast({
          title: 'Locations edited',
          preset: 'done',
          haptic: 'success',
        });
      } catch (err) {
        logger.error('Error updating locations', { err });
        await dialog.error('Failed to Edit Locations', getErrorMessage(err));
      }
    },
    [linkId, partyId, dialog, invalidate],
  );

  const deleteLocation = useCallback(
    async (locationId: string) => {
      const confirmed = await dialog.confirmDanger(
        'Delete Location?',
        'This will delete the location section. Photos and videos will still exist.',
      );
      if (!confirmed) return;

      try {
        await deleteLinkLocation(locationId);
        Burnt.toast({
          title: 'Location removed',
          preset: 'done',
          haptic: 'success',
        });
      } catch (err) {
        logger.error('Error deleting location', { err });
        await dialog.error('Failed to Remove Location', getErrorMessage(err));
      }
    },
    [linkId, partyId, dialog, invalidate],
  );

  return {
    confirmLocation,
    editLocation,
    editLocations,
    deleteLocation,
  };
}
