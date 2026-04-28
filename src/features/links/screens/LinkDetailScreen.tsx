import {
  ComponentProps,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';
import {
  View,
  GestureResponderEvent,
  FlatList,
  useWindowDimensions,
  Pressable,
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
  Button,
} from '../../../components';
import { useStagedMediaActions } from '../hooks/useStagedMediaActions';
import StagedMediaSheet from '../components/StagedMediaSheet';
import { formatDateTime } from '../../../lib/utils/formatTime';
import { useActiveLinkContext } from '../../../providers/ActiveLinkProvider';
import { StatusBar } from 'expo-status-bar';
import { Tabs, MaterialTabBar } from 'react-native-collapsible-tab-view';
import { LinkLocationRow, LinkMedia, LinkPostMedia } from '../../../lib/models';
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
import { useLinkLocationsActions } from '../hooks/useLinkLocationsActions';
import { DropdownMenuItemProps } from '../../../components/DropdownMenu';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LocationPickerModal from '../components/LocationPickerModal';
import ManageLocationsModal from '../components/ManageLocationsModal';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import SelectionPill from '../components/SelectionPill';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import SetMediaLocationModal from '../components/SetMediaLocationModal';

type Props = NativeStackScreenProps<PartyStackParamList, 'LinkDetail'>;

export default function LinkDetailScreen({ route, navigation }: Props) {
  const { linkId, partyId } = route.params;
  const { userId } = useAuth();
  const rootNav = useNavigation<NativeStackNavigationProp<SignedInParamList>>();
  const insets = useSafeAreaInsets();
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
  const locationActions = useLinkLocationsActions({ linkId, partyId });

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

  const [selectedMedia, setSelectedMedia] = useState<Map<string, LinkMedia>>(
    new Map(),
  );
  const pillOffset = useSharedValue(-100);
  const [mediaLocationVisible, setMediaLocationVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [manageLocationsVisible, setManageLocationsVisible] = useState(false);
  const [editingLocation, setEditingLocation] =
    useState<LinkLocationRow | null>(null);
  const isSelecting = selectedMedia.size > 0;

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

  useEffect(() => {
    pillOffset.value = withSpring(isSelecting ? 0 : -100, {
      damping: 300,
      stiffness: 300,
    });
  }, [isSelecting]);

  if (linkLoading) return <LoadingScreen label="Loading..." />;
  if (linkError || !linkDetail)
    return <DataFallbackScreen onAction={refetchLink} />;

  const isActive = linkDetail && !linkDetail.end_time;
  const isOwner = linkDetail.owner_id === userId;
  const isMember = linkDetail.members.some((m) => m.id === userId) ?? false;

  const handleMediaPress = (media: LinkPostMedia) => {
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

  const menuItems: DropdownMenuItemProps[] = [];

  if (isOwner) {
    menuItems.push({
      icon: 'edit-2',
      label: 'Edit Link',
      onPress: () => {
        setEditModalVisible(true);
      },
    });

    if (isActive) {
      menuItems.push({
        icon: 'check-circle',
        label: 'End Link',
        onPress: () => {
          linkActions.endLink();
        },
      });
    }

    menuItems.push({
      icon: 'trash-2',
      label: 'Delete Link',
      onPress: () => {
        linkActions.deleteLink();
      },
      variant: 'danger',
    });
  } else if (isMember) {
    menuItems.push({
      icon: 'log-out',
      label: 'Leave Link',
      onPress: () => {
        linkActions.leaveLink();
      },
      variant: 'danger',
    });
  } else if (isActive) {
    menuItems.push({
      icon: 'log-in',
      label: 'Join Link',
      onPress: () => {
        linkActions.joinLink();
      },
    });
  }

  const handleEditSave = async (changes: EditLinkChanges) => {
    await linkActions.editLink(changes);
    setEditModalVisible(false);
  };

  const handleEnterSelectMode = useCallback((media: LinkMedia) => {
    setSelectedMedia(new Map([[media.id, media]]));
  }, []);

  const handleToggleSelect = useCallback((media: LinkMedia) => {
    setSelectedMedia((prev) => {
      const next = new Map(prev);
      if (next.has(media.id)) next.delete(media.id);
      else next.set(media.id, media);
      return next;
    });
  }, []);

  const handleExitSelectMode = useCallback(() => {
    setSelectedMedia(new Map());
  }, []);

  const handleDeleteSelected = useCallback(async () => {
    const succeeded = await linkActions.deleteSelectedMedia(selectedMedia);
    if (succeeded) handleExitSelectMode();
  }, [selectedMedia, linkActions.deleteSelectedMedia, handleExitSelectMode]);

  const handleSetLocation = useCallback(
    async (locationId: string | null) => {
      setMediaLocationVisible(false);
      const succeeded = await locationActions.setSelectedMediaLocation(
        selectedMedia,
        locationId,
      );
      if (succeeded) handleExitSelectMode();
    },
    [selectedMedia, locationActions, handleExitSelectMode],
  );

  const pillStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: pillOffset.value }],
  }));

  return (
    <>
      <StatusBar style="light" />

      <Tabs.Container
        minHeaderHeight={insets.top}
        renderHeader={() => (
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
        )}
        renderTabBar={(props) => (
          <View style={{ backgroundColor: theme.colors.background }}>
            <MaterialTabBar
              {...props}
              activeColor={theme.colors.tabActive}
              inactiveColor={theme.colors.tabInactive}
              tabStyle={{ backgroundColor: theme.colors.tabBackground }}
              indicatorStyle={{ backgroundColor: theme.colors.tabActive }}
              labelStyle={{ fontWeight: '600', fontSize: 13 }}
            />
          </View>
        )}
        containerStyle={{ flex: 1, backgroundColor: theme.colors.background }}
      >
        {/* Timeline */}
        <Tabs.Tab name="Overview">
          <Tabs.FlatList
            data={sections}
            keyExtractor={(loc) => loc?.id ?? 'unknown'}
            renderItem={({ item: location }) => (
              <View style={{ paddingHorizontal: theme.spacing.lg }}>
                <LocationSection
                  linkId={linkId}
                  location={location}
                  onPressMedia={() => {}}
                  onDeleteMedia={linkActions.deleteMedia}
                  onConfirm={() =>
                    location && locationActions.confirmLocation(location.id)
                  }
                  onEdit={() => location && setEditingLocation(location)}
                  onDelete={() =>
                    location && locationActions.deleteLocation(location.id)
                  }
                  isSelecting={isSelecting}
                  selectedMedia={selectedMedia}
                  onEnterSelectMode={handleEnterSelectMode}
                  onToggleSelect={handleToggleSelect}
                />
              </View>
            )}
            ListHeaderComponent={
              <View
                style={{
                  paddingHorizontal: theme.spacing.lg,
                  paddingTop: theme.spacing.md,
                }}
              >
                <LinkInfoCard link={linkDetail} />
                <SectionHeader
                  title="Location Timeline"
                  style={{ marginTop: theme.spacing.lg }}
                  action={
                    <Row gap="xs">
                      <Pressable
                        onPress={() => setManageLocationsVisible(true)}
                        style={[
                          styles.timelineAction,
                          { backgroundColor: `${theme.colors.primary}20` },
                        ]}
                      >
                        <Feather
                          name="plus"
                          size={12}
                          color={theme.colors.primary}
                        />
                        <Text variant="labelSm" color="accent">
                          Manage
                        </Text>
                      </Pressable>
                    </Row>
                  }
                />
              </View>
            }
          />
        </Tabs.Tab>

        {/* Map */}
        <Tabs.Tab name="Map">
          <Tabs.ScrollView>
            <Text variant="bodyMd" color="tertiary">
              Map
            </Text>
          </Tabs.ScrollView>
        </Tabs.Tab>
      </Tabs.Container>

      {isActive && isMember && hasAssets && (
        <View
          style={[StyleSheet.absoluteFillObject, { zIndex: 50 }]}
          pointerEvents="box-none"
        >
          <StagedMediaSheet
            assets={stagedAssets}
            onAddFromGallery={addFromGallery}
            onRemove={removeAsset}
            onClearAll={clearAll}
            onUpload={uploadAll}
            uploading={uploading}
          />
        </View>
      )}

      <View
        style={[StyleSheet.absoluteFillObject, { zIndex: 100 }]}
        pointerEvents="box-none"
      >
        <Animated.View
          style={[
            {
              position: 'absolute',
              top: insets.top + 8,
              left: 16,
              right: 16,
            },
            pillStyle,
          ]}
          pointerEvents={isSelecting ? 'auto' : 'none'}
        >
          <SelectionPill
            selectedMedia={selectedMedia}
            onSetLocation={() => setMediaLocationVisible(true)}
            onDelete={handleDeleteSelected}
            onCancel={handleExitSelectMode}
          />
        </Animated.View>
      </View>

      {isActive && !isMember && (
        <JoinLinkBanner
          onJoin={linkActions.joinLink}
          memberCount={linkDetail.members.length}
        />
      )}

      <DropdownMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        anchor={menuAnchor}
        items={menuItems}
      />
      <UploadProgressModal visible={uploading} progress={progress} />

      <LocationPickerModal
        visible={!!editingLocation}
        location={editingLocation}
        onClose={() => setEditingLocation(null)}
        onSave={(data) =>
          locationActions.editLocation(editingLocation.id, data)
        }
      />

      <ManageLocationsModal
        visible={manageLocationsVisible}
        locations={locations}
        onClose={() => setManageLocationsVisible(false)}
        onSave={async (locations) => locationActions.editLocations(locations)}
      />

      <SetMediaLocationModal
        visible={mediaLocationVisible}
        locations={locations}
        onClose={() => setMediaLocationVisible(false)}
        onSelect={handleSetLocation}
      />
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
  statusBadgeActive: { backgroundColor: theme.colors.badgeActive },
  statusBadgeEnded: { backgroundColor: theme.colors.badgeInactive },
  timelineAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radii.full,
  },
}));
