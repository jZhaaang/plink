import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Image } from 'expo-image';
import { useVideoPlayer, VideoView } from 'expo-video';
import { View, useWindowDimensions, StatusBar, Pressable } from 'react-native';
import {
  GestureViewer,
  useGestureViewerEvent,
  useGestureViewerState,
} from 'react-native-gesture-image-viewer';
import { SignedInParamList } from '../../../navigation/types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FlatList } from 'react-native-gesture-handler';
import { useLinkPosts } from '../hooks/useLinkPosts';
import Animated, {
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { StyleSheet } from 'react-native-unistyles';
import { VideoControls } from '../components/VideoControls';
import { LinkPostWithMedia } from '../../../lib/models';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import Burnt from 'burnt';
import { File, Paths } from 'expo-file-system';
import { logger } from '../../../lib/telemetry/logger';
import { MediaViewerTopBar } from '../components/MediaViewerTopBar';
import { MediaViewerBottomBar } from '../components/MediaViewerBottomBar';

type Props = NativeStackScreenProps<SignedInParamList, 'MediaViewer'>;

type MediaItemProps = {
  url: string;
  width: number;
  height: number;
  onPress: () => void;
};

function ImageItem({ url, width, height, onPress }: MediaItemProps) {
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
  url,
  width,
  height,
  isActive,
  overlayOpacity,
  overlayPointerEvents,
  onPress,
}: MediaItemProps & {
  isActive: boolean;
  overlayOpacity: SharedValue<number>;
  overlayPointerEvents: 'box-none' | 'none';
}) {
  const player = useVideoPlayer(url, (p) => {
    p.loop = false;
  });

  useEffect(() => {
    if (isActive) {
      player.play();
    } else {
      player.pause();
      player.currentTime = 0;
    }
  }, [isActive, player]);

  const controlsStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  return (
    <View style={{ width, height }}>
      <VideoView
        player={player}
        style={{ width, height }}
        contentFit="contain"
        nativeControls={false}
      />

      <Pressable
        onPress={onPress}
        style={[StyleSheet.absoluteFill, { zIndex: 1 }]}
      />
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          { justifyContent: 'flex-end', zIndex: 2 },
          controlsStyle,
        ]}
        pointerEvents={overlayPointerEvents}
      >
        <VideoControls player={player} />
      </Animated.View>
    </View>
  );
}

export default function MediaViewerScreen({ route, navigation }: Props) {
  const { linkId, initialIndex } = route.params;
  const insets = useSafeAreaInsets();

  const { posts, allMedia, fetchNextPage, hasNextPage } = useLinkPosts(linkId);
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

  const postMap = useMemo(() => {
    const map = new Map<string, LinkPostWithMedia>();
    for (const post of posts) map.set(post.id, post);
    return map;
  }, [posts]);

  const currentMedia = allMedia[currentIndex];
  const currentPost = currentMedia
    ? (postMap.get(currentMedia.post_id) ?? null)
    : null;

  const mediaItems = useMemo(
    () => allMedia.map((item, index) => ({ ...item, index })),
    [allMedia],
  );
  const mediaHeight = height - insets.bottom;

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
      const file = await File.downloadFileAsync(currentMedia.url, dest);
      await MediaLibrary.saveToLibraryAsync(file.uri);
      Burnt.toast({ title: 'Saved to photos', preset: 'done' });
    } catch (err) {
      logger.error('Error downloading media', {
        err,
        mediaId: currentMedia.id,
        url: currentMedia.url,
      });
      Burnt.toast({ title: 'Download failed', preset: 'error' });
    }
  };

  const handleShare = async () => {
    if (!currentMedia) return;

    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) return;

    try {
      const ext = currentMedia.mime.split('/')[1] ?? 'jpg';
      const dest = new File(Paths.cache, `plink_${currentMedia.id}.${ext}`);
      const file = await File.downloadFileAsync(currentMedia.url, dest);
      await Sharing.shareAsync(file.uri);
    } catch (err) {
      logger.error('Error sharing media', {
        err,
        mediaId: currentMedia.id,
        url: currentMedia.url,
      });
      Burnt.toast({ title: 'Could not share', preset: 'error' });
    }
  };

  const renderItem = useCallback(
    (item) => {
      const isActive = item.index === currentIndex;
      if (item.type === 'video') {
        return (
          <VideoItem
            url={item.url}
            width={width}
            height={mediaHeight}
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
              animatedStyle={overlayAnimatedStyle}
              pointerEvents={overlayPointerEvents}
              post={currentPost}
            />
          </View>
        )}
      />
    </View>
  );
}
