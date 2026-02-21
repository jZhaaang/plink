import { useCallback, useMemo } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Image } from 'expo-image';
import { useVideoPlayer, VideoView } from 'expo-video';
import { View, useWindowDimensions, StatusBar, FlatList } from 'react-native';
import {
  GestureViewer,
  useGestureViewerState,
} from 'react-native-gesture-image-viewer';
import { PartyStackParamList } from '../../../navigation/types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLinkDetail } from '../hooks/useLinkDetail';
import MediaViewerOverlay from '../components/MediaViewerOverlay';

type Props = NativeStackScreenProps<PartyStackParamList, 'MediaViewer'>;

type MediaItemProps = {
  url: string;
  width: number;
  height: number;
};

function VideoItem({ url, width, height }: MediaItemProps) {
  const player = useVideoPlayer(url, (p) => {
    p.loop = false;
  });

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
  const { link } = useLinkDetail(linkId);
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const { currentIndex, totalCount } = useGestureViewerState();

  const mediaItems = useMemo(() => {
    if (!link) return [];
    return link.posts.flatMap((post) => post.media);
  }, [link]);

  const mediaHeight = height - insets.bottom;

  const renderItem = useCallback(
    (item) => {
      if (item.type === 'video') {
        return <VideoItem url={item.url} width={width} height={mediaHeight} />;
      } else {
        return <ImageItem url={item.url} width={width} height={mediaHeight} />;
      }
    },
    [width, mediaHeight],
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
