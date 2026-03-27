import { useCallback, useEffect, useMemo } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Image } from 'expo-image';
import { useVideoPlayer, VideoView } from 'expo-video';
import { View, useWindowDimensions, StatusBar } from 'react-native';
import {
  GestureViewer,
  useGestureViewerState,
} from 'react-native-gesture-image-viewer';
import { PartyStackParamList } from '../../../navigation/types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MediaViewerOverlay from '../components/MediaViewerOverlay';
import { FlatList } from 'react-native-gesture-handler';
import { useLinkPosts } from '../hooks/useLinkPosts';

type Props = NativeStackScreenProps<PartyStackParamList, 'MediaViewer'>;

type MediaItemProps = {
  url: string;
  width: number;
  height: number;
  isActive?: boolean;
};

function VideoItem({ url, width, height, isActive }: MediaItemProps) {
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

  return (
    <VideoView
      player={player}
      style={{ width, height }}
      contentFit="contain"
      nativeControls
    />
  );
}

function ImageItem({ url, width, height }: MediaItemProps) {
  return (
    <Image
      source={url}
      style={{ width, height }}
      contentFit="contain"
      cachePolicy="memory-disk"
      transition={200}
    />
  );
}

export default function MediaViewerScreen({ route, navigation }: Props) {
  const { linkId, initialIndex } = route.params;
  const { allMedia, fetchNextPage, hasNextPage } = useLinkPosts(linkId);
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const { currentIndex, totalCount } = useGestureViewerState();

  useEffect(() => {
    if (
      hasNextPage &&
      allMedia.length > 0 &&
      currentIndex >= allMedia.length - 3
    ) {
      fetchNextPage();
    }
  }, [currentIndex, allMedia.length, hasNextPage, fetchNextPage]);

  const mediaItems = useMemo(
    () => allMedia.map((item, index) => ({ ...item, index })),
    [allMedia],
  );

  const mediaHeight = height - insets.bottom;

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
          />
        );
      } else {
        return <ImageItem url={item.url} width={width} height={mediaHeight} />;
      }
    },
    [width, mediaHeight, currentIndex],
  );

  return (
    <View style={{ flex: 1, backgroundColor: 'black' }}>
      <StatusBar barStyle="light-content" />

      <MediaViewerOverlay
        currentIndex={currentIndex}
        totalCount={totalCount}
        onClose={() => navigation.goBack()}
      />

      <GestureViewer
        data={mediaItems}
        initialIndex={initialIndex}
        ListComponent={FlatList}
        renderItem={renderItem}
        onDismiss={() => navigation.goBack()}
      />
    </View>
  );
}
