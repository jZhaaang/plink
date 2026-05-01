import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Image } from 'expo-image';
import { useVideoPlayer, VideoPlayer, VideoView } from 'expo-video';
import { View, useWindowDimensions, StatusBar, Pressable } from 'react-native';
import {
  GestureViewer,
  useGestureViewerEvent,
  useGestureViewerState,
} from 'react-native-gesture-image-viewer';
import { SignedInParamList } from '../../../navigation/types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FlatList } from 'react-native-gesture-handler';
import Animated, {
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { StyleSheet } from 'react-native-unistyles';
import { LinkMedia } from '../../../lib/models';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import * as Burnt from 'burnt';
import { File, Paths } from 'expo-file-system';
import { logger } from '../../../lib/telemetry/logger';
import { MediaViewerTopBar } from '../components/MediaViewerTopBar';
import { MediaViewerBottomBar } from '../components/MediaViewerBottomBar';
import { useLinkMedia } from '../hooks/useLinkMedia';

type Props = NativeStackScreenProps<SignedInParamList, 'MediaViewer'>;

type MediaItemProps = {
  width: number;
  height: number;
  onPress: () => void;
};

function ImageItem({
  url,
  width,
  height,
  onPress,
}: MediaItemProps & { url: string }) {
  return (
    <Pressable onPress={onPress}>
      <Image
        source={url}
        style={{ width, height }}
        contentFit="contain"
        cachePolicy="memory-disk"
        transition={200}
      />
    </Pressable>
  );
}

function VideoItem({
  thumbnailUrl,
  width,
  height,
  player,
  isActive,
  onPress,
}: MediaItemProps & {
  thumbnailUrl: string;
  player: VideoPlayer;
  isActive: boolean;
  overlayOpacity: SharedValue<number>;
  overlayPointerEvents: 'box-none' | 'none';
}) {
  const [isReady, setIsReady] = useState(false);
  const thumbnailOpacity = useSharedValue(1);

  useEffect(() => {
    const sub = player.addListener('statusChange', (e) => {
      if (e.status === 'readyToPlay') {
        setIsReady(true);
        thumbnailOpacity.value = withTiming(0, { duration: 200 });
      }
    });

    if (isActive) {
      player.play();
    } else {
      player.pause();
      player.currentTime = 0;
      setIsReady(false);
      thumbnailOpacity.value = 1;
    }

    return () => sub.remove();
  }, [isActive, player, thumbnailOpacity]);

  useEffect(() => {
    thumbnailOpacity.value = 1;
  }, [thumbnailUrl, thumbnailOpacity]);

  const thumbnailStyle = useAnimatedStyle(() => ({
    opacity: thumbnailOpacity.value,
  }));

  return (
    <View style={{ width, height }}>
      {isReady && (
        <VideoView
          player={player}
          style={{ width, height }}
          contentFit="contain"
          nativeControls={false}
        />
      )}

      <Animated.View
        style={[StyleSheet.absoluteFill, thumbnailStyle]}
        pointerEvents="none"
      >
        <Image
          source={thumbnailUrl}
          style={{ width, height }}
          contentFit="contain"
          cachePolicy="memory-disk"
        />
      </Animated.View>

      <Pressable
        onPress={onPress}
        style={[StyleSheet.absoluteFill, { zIndex: 1 }]}
      />
    </View>
  );
}

export default function MediaViewerScreen({ route, navigation }: Props) {
  const { linkId, initialMediaId } = route.params;
  const insets = useSafeAreaInsets();

  const { allMedia, fetchNextPage, hasNextPage } = useLinkMedia(linkId);
  const { width, height } = useWindowDimensions();
  const { currentIndex, totalCount } = useGestureViewerState();

  const overlayOpacity = useSharedValue(1);
  const overlayVisibleRef = useRef(true);
  const [overlayPointerEvents, setOverlayPointerEvents] = useState<
    'box-none' | 'none'
  >('box-none');
  const overlayAnimatedStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const toggleOverlay = useCallback(() => {
    overlayVisibleRef.current = !overlayVisibleRef.current;
    const visible = overlayVisibleRef.current;
    overlayOpacity.value = withTiming(visible ? 1 : 0, { duration: 200 });
    setOverlayPointerEvents(visible ? 'box-none' : 'none');
  }, [overlayOpacity]);

  useGestureViewerEvent('zoomChange', ({ scale }) => {
    if (scale > 1.05 && overlayVisibleRef.current) {
      overlayOpacity.value = withTiming(0, { duration: 200 });
      overlayVisibleRef.current = false;
      setOverlayPointerEvents('none');
    }
  });

  useEffect(() => {
    if (
      hasNextPage &&
      allMedia.length > 0 &&
      currentIndex >= allMedia.length - 3
    ) {
      fetchNextPage();
    }
  }, [currentIndex, allMedia.length, hasNextPage, fetchNextPage]);

  const currentMedia = allMedia[currentIndex] ?? null;

  const initialIndex = useMemo(() => {
    const idx = allMedia.findIndex((m) => m.id === initialMediaId);
    return idx === -1 ? 0 : idx;
  }, [allMedia, initialMediaId]);

  const mediaItems = useMemo(
    () => allMedia.map((item, index) => ({ ...item, index })),
    [allMedia],
  );
  const mediaHeight = height - insets.bottom;

  const currentPlayer = useVideoPlayer(
    currentMedia?.type === 'video' ? currentMedia.url : '',
    (p) => {
      p.loop = false;
    },
  );

  const handleDownload = async () => {
    if (!currentMedia) return;

    const perm = await MediaLibrary.requestPermissionsAsync();
    if (!perm.granted) {
      Burnt.toast({ title: 'Permission denied', preset: 'error' });
      return;
    }

    try {
      const ext = currentMedia.mime.split('/')[1] ?? 'jpg';
      const dest = new File(Paths.cache, `plink_${currentMedia.id}.${ext}`);
      const file = dest.exists
        ? dest
        : await File.downloadFileAsync(currentMedia.url, dest);
      await MediaLibrary.saveToLibraryAsync(file.uri);
      Burnt.toast({
        title: 'Successfully downloaded',
        preset: 'done',
        haptic: 'success',
      });
    } catch (err) {
      logger.error('Error downloading media', {
        err,
        mediaId: currentMedia.id,
        url: currentMedia.url,
      });
      Burnt.toast({
        title: 'Download failed',
        preset: 'error',
        haptic: 'warning',
      });
    }
  };

  const handleShare = async () => {
    if (!currentMedia) return;

    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) return;

    try {
      const ext = currentMedia.mime.split('/')[1] ?? 'jpg';
      const dest = new File(Paths.cache, `plink_${currentMedia.id}.${ext}`);
      const file = dest.exists
        ? dest
        : await File.downloadFileAsync(currentMedia.url, dest);
      await Sharing.shareAsync(file.uri);
      Burnt.toast({
        title: 'Successfully shared',
        preset: 'done',
        haptic: 'success',
      });
    } catch (err) {
      logger.error('Error sharing media', {
        err,
        mediaId: currentMedia.id,
        url: currentMedia.url,
      });
      Burnt.toast({
        title: 'Could not share',
        preset: 'error',
        haptic: 'warning',
      });
    }
  };

  const renderItem = useCallback(
    (item: LinkMedia & { index: number }) => {
      const isActive = item.index === currentIndex;
      if (item.type === 'video') {
        return (
          <VideoItem
            thumbnailUrl={item.thumbnailUrl ?? null}
            width={width}
            height={mediaHeight}
            player={currentPlayer}
            isActive={isActive}
            overlayOpacity={overlayOpacity}
            overlayPointerEvents={overlayPointerEvents}
            onPress={toggleOverlay}
          />
        );
      } else {
        return (
          <ImageItem
            url={item.url}
            width={width}
            height={mediaHeight}
            onPress={toggleOverlay}
          />
        );
      }
    },
    [
      width,
      mediaHeight,
      currentIndex,
      overlayOpacity,
      overlayPointerEvents,
      toggleOverlay,
    ],
  );

  if (allMedia.length === 0) {
    return <View style={{ flex: 1, backgroundColor: 'black' }} />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: 'black' }}>
      <StatusBar barStyle="light-content" />

      <GestureViewer
        data={mediaItems}
        initialIndex={initialIndex}
        ListComponent={FlatList}
        renderItem={renderItem}
        onDismissStart={() => {
          overlayOpacity.value = withTiming(0, { duration: 200 });
          setOverlayPointerEvents('none');
        }}
        onDismiss={() => navigation.goBack()}
        enablePinchZoom
        enableDoubleTapZoom
        maxZoomScale={10}
        renderContainer={(children, { dismiss }) => (
          <View style={{ flex: 1 }}>
            {children}
            <MediaViewerTopBar
              animatedStyle={overlayAnimatedStyle}
              pointerEvents={overlayPointerEvents}
              currentIndex={currentIndex}
              totalCount={totalCount}
              onClose={dismiss}
              onDownload={handleDownload}
              onShare={handleShare}
            />
            <MediaViewerBottomBar
              media={currentMedia}
              isVideo={currentMedia.type === 'video'}
              player={currentPlayer}
              animatedStyle={overlayAnimatedStyle}
              pointerEvents={overlayPointerEvents}
            />
          </View>
        )}
      />
    </View>
  );
}
