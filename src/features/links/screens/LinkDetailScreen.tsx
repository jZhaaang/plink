import { ComponentProps, useCallback, useState } from 'react';
import {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';
import {
  View,
  GestureResponderEvent,
  FlatList,
  useWindowDimensions,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import {
  PartyStackParamList,
  SignedInParamList,
} from '../../../navigation/types';
import { useLinkDetail } from '../hooks/useLinkDetail';
import { useLinkDetailActions } from '../hooks/useLinkDetailActions';
import {
  DropdownMenu,
  DropdownMenuItem,
  LoadingScreen,
  DataFallbackScreen,
  HeroBanner,
  UploadProgressModal,
  Text,
  Row,
  SectionHeader,
} from '../../../components';
import { useStagedMediaActions } from '../hooks/useStagedMediaActions';
import StagedMediaSheet from '../components/StagedMediaSheet';
import { formatDateTime } from '../../../lib/utils/formatTime';
import { useActiveLinkContext } from '../../../providers/ActiveLinkProvider';
import { StatusBar } from 'expo-status-bar';
import { LinkPostMedia } from '../../../lib/models';
import {
  StackActions,
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native';
import { useAuth } from '../../../providers/AuthProvider';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { useThumbnailSubscription } from '../hooks/useThumbnailSubscription';
import JoinLinkBanner from '../components/JoinLinkBanner';
import { useLinkPosts } from '../hooks/useLinkPosts';
import EditLinkModal, { EditLinkChanges } from '../components/EditLinkModal';
import { useLinkLocations } from '../hooks/useLinkLocations';
import { useInvalidate } from '../../../lib/supabase/hooks/useInvalidate';
import { confirmLinkLocation } from '../../../lib/supabase/queries/linkLocations';
import { logger } from '../../../lib/telemetry/logger';
import LocationSection from '../components/LocationSection';
import LinkInfoCard from '../components/LinkInfoCard';

type Props = NativeStackScreenProps<PartyStackParamList, 'LinkDetail'>;

export default function LinkDetailScreen({ route, navigation }: Props) {
  const { linkId, partyId } = route.params;
  const { userId } = useAuth();
  const rootNav = useNavigation<NativeStackNavigationProp<SignedInParamList>>();
  const { theme } = useUnistyles();

  const invalidate = useInvalidate();
  const {
    linkDetail,
    loading: linkLoading,
    error: linkError,
    refetch: refetchLink,
  } = useLinkDetail(linkId);

  const { data: locations = [], isLoading: locationsLoading } =
    useLinkLocations(linkId);
  const sections = [...locations, null];
  const linkActions = useLinkDetailActions({
    linkId,
    partyId,
    linkDetail,
    onDelete: () => {
      const state = navigation.getState();
      const isStackRoot = state.index === 0;

      if (!isStackRoot) {
        navigation.dispatch(StackActions.pop());
      } else {
        navigation.getParent()?.navigate('Party', {
          screen: 'PartyDetail',
          params: { partyId },
        });
      }
    },
    onLeave: () => navigation.goBack(),
  });

  const { uploadAction, clearUploadAction } = useActiveLinkContext();

  const {
    stagedAssets,
    stageAssets,
    addFromGallery,
    removeAsset,
    clearAll,
    uploadAll,
    uploading,
    progress,
    hasAssets,
    pendingMediaIds,
    clearPendingMediaIds,
  } = useStagedMediaActions({
    linkId,
    partyId,
    userId,
  });
  useThumbnailSubscription(linkId, pendingMediaIds, clearPendingMediaIds);

  const [menuVisible, setMenuVisible] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (!uploadAction) return;
      clearUploadAction();

      switch (uploadAction) {
        case 'gallery':
          addFromGallery();
          break;
      }
    }, [uploadAction, clearUploadAction]),
  );

  const { width: screenWidth } = useWindowDimensions();
  const TILE_GAP = 2;
  const TILE_COLUMNS = 4;
  const CONTAINER_PADDING = 32;
  const tileSize =
    (screenWidth - CONTAINER_PADDING - TILE_GAP * (TILE_COLUMNS - 1)) /
    TILE_COLUMNS;

  if (linkLoading) return <LoadingScreen label="Loading..." />;
  if (linkError || !linkDetail)
    return <DataFallbackScreen onAction={refetchLink} />;

  const startFormatted = formatDateTime(linkDetail.created_at);
  const endFormatted = formatDateTime(linkDetail.end_time);
  const isActive = linkDetail && !linkDetail.end_time;
  const isOwner = linkDetail.owner_id === userId;
  const isMember = linkDetail.members.some((m) => m.id === userId) ?? false;
  const memberAvatars = linkDetail.members
    .map((m) => m.avatarUrl)
    .filter((url): url is string => !!url);
  const owner = linkDetail.members.find((m) => m.id === linkDetail.owner_id);

  const handleMediaPress = (item: LinkPostMedia) => {
    // const index = allMedia.findIndex((m) => m.id === item.id);
    // rootNav.navigate('MediaViewer', {
    //   linkId,
    //   initialIndex: index === -1 ? 0 : index,
    // });
  };

  const handleSeeAllMedia = () => {
    rootNav.navigate('AllMedia', { linkId });
  };

  const handleMenuPress = (event: GestureResponderEvent) => {
    event.currentTarget.measureInWindow(
      (x: number, y: number, width: number, height: number) => {
        setMenuAnchor({ x: x + width, y: y + height });
        setMenuVisible(true);
      },
    );
  };

  const menuItems: Array<{
    icon: ComponentProps<typeof Feather>['name'];
    label: string;
    action: () => void;
    variant?: 'danger';
  }> = [];

  if (isOwner) {
    menuItems.push({
      icon: 'edit-2',
      label: 'Edit Link',
      action: () => {
        setMenuVisible(false);
        setEditModalVisible(true);
      },
    });

    if (isActive) {
      menuItems.push({
        icon: 'check-circle',
        label: 'End Link',
        action: () => {
          setMenuVisible(false);
          linkActions.endLink();
        },
      });
    }

    menuItems.push({
      icon: 'trash-2',
      label: 'Delete Link',
      action: () => {
        setMenuVisible(false);
        linkActions.deleteLink();
      },
      variant: 'danger',
    });
  } else if (isMember) {
    menuItems.push({
      icon: 'log-out',
      label: 'Leave Link',
      action: () => {
        setMenuVisible(false);
        linkActions.leaveLink();
      },
      variant: 'danger',
    });
  } else if (isActive) {
    menuItems.push({
      icon: 'log-in',
      label: 'Join Link',
      action: () => {
        setMenuVisible(false);
        linkActions.joinLink();
      },
    });
  }

  const handleEditSave = async (changes: EditLinkChanges) => {
    await linkActions.editLink(changes);
    setEditModalVisible(false);
  };

  const handleConfirmLocation = async (locationId: string) => {
    try {
      await confirmLinkLocation(locationId);
      invalidate.onLinkLocationsChanged(linkId);
    } catch (err) {
      logger.error('Failed to confirm location', { err });
    }
  };

  const handleEditLocation = (locationId: string) => {};

  return (
    <>
      <View style={styles.root}>
        <StatusBar style="light" />

        <HeroBanner
          variant="default"
          bannerUri={linkDetail.bannerUrl ?? null}
          emptyHint="Add a photo to set a banner"
          onBack={() => navigation.goBack()}
          onMenuPress={handleMenuPress}
        >
          <Row align="center">
            <View
              style={[
                styles.statusBadge,
                isActive ? styles.statusBadgeActive : styles.statusBadgeEnded,
              ]}
            >
              <Text variant="labelSm" color="inverse">
                {isActive ? 'Active' : 'Ended'}
              </Text>
            </View>
          </Row>
          <Text variant="displaySm" color="inverse">
            {linkDetail.name}
          </Text>
          <Text variant="bodyMd" color="inverseMuted">
            {linkDetail.members.length}{' '}
            {linkDetail.members.length === 1 ? 'member' : 'members'}
          </Text>
        </HeroBanner>

        <View style={styles.contentArea}>
          <FlatList
            data={sections}
            keyExtractor={(loc) => loc?.id ?? 'unknown'}
            renderItem={({ item: location }) => (
              <View style={{ paddingHorizontal: theme.spacing.lg }}>
                <LocationSection
                  linkId={linkId}
                  location={location}
                  tileSize={tileSize}
                  onDeleteMedia={linkActions.deleteMedia}
                  onConfirm={() =>
                    location && handleConfirmLocation(location.id)
                  }
                  onEdit={() => location && handleEditLocation(location.id)}
                  onRemove={() => {}}
                />
              </View>
            )}
            ListHeaderComponent={
              <View style={{ paddingHorizontal: theme.spacing.lg }}>
                <LinkInfoCard link={linkDetail} />

                <SectionHeader
                  title="Timeline"
                  style={{ marginTop: theme.spacing.lg }}
                />
              </View>
            }
          />

          {/* Bottom Actions (for active links) */}
          {isActive && isMember && (
            <>
              {hasAssets && (
                <StagedMediaSheet
                  assets={stagedAssets}
                  onAddFromGallery={addFromGallery}
                  onRemove={removeAsset}
                  onClearAll={clearAll}
                  onUpload={uploadAll}
                  uploading={uploading}
                />
              )}
            </>
          )}

          {isActive && !isMember && (
            <JoinLinkBanner
              onJoin={linkActions.joinLink}
              memberCount={linkDetail.members.length}
            />
          )}

          {/* Dropdown Menu */}
          <DropdownMenu
            visible={menuVisible}
            onClose={() => setMenuVisible(false)}
            anchor={menuAnchor}
          >
            {menuItems.map((item, index) => (
              <DropdownMenuItem
                key={index}
                icon={item.icon}
                label={item.label}
                onPress={item.action}
                variant={item.variant}
              />
            ))}
          </DropdownMenu>

          <UploadProgressModal visible={uploading} progress={progress} />
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create((theme) => ({
  root: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: theme.radii.full,
  },
  statusBadgeActive: {
    backgroundColor: theme.colors.badgeActive,
  },
  statusBadgeEnded: {
    backgroundColor: theme.colors.badgeInactive,
  },
  contentArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
    marginTop: theme.spacing.lg,
  },
  container: {
    paddingVertical: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    paddingHorizontal: theme.spacing.lg,
  },
}));
