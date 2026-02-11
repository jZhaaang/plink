import { useEffect, useRef, useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Image } from 'expo-image';
import { useVideoPlayer, VideoView } from 'expo-video';
import {
  View,
  Text,
  FlatList,
  Pressable,
  useWindowDimensions,
  StatusBar,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

import { PartyStackParamList } from '../../../navigation/types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = NativeStackScreenProps<PartyStackParamList, 'MediaViewer'>;

type VideoProps = {
  url: string;
  width: number;
  height: number;
  isActive: boolean;
};

function VideoItem({ url, width, height, isActive }: VideoProps) {
  const player = useVideoPlayer(url, (p) => {
    p.loop = false;
  });

  useEffect(() => {
    if (!isActive) {
      player.pause();
    }
  }, [isActive, player]);

  return (
    <View style={{ width, height }} className="items-center justify-center">
      <VideoView
        player={player}
        style={{ width, height }}
        contentFit="contain"
        fullscreenOptions={{ enable: true }}
        allowsPictureInPicture={false}
        nativeControls
      />
    </View>
  );
}

export default function MediaViewerScreen({ route, navigation }: Props) {
  const { mediaItems, initialIndex } = route.params;
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const flatListRef = useRef<FlatList>(null);

  const mediaHeight = height - insets.bottom;

  return (
    <View className="flex-1 bg-black">
      <StatusBar barStyle="light-content" />
      {/* Header */}
      <View
        className="absolute top-0 left-0 right-0 z-10 px-4 pb-4"
        style={{ paddingTop: insets.top + 8 }}
      >
        <View className="flex-row items-center justify-between">
          <Pressable
            onPress={() => navigation.goBack()}
            className="p-2 -ml-2 bg-black/40 rounded-full"
          >
            <Feather name="x" size={24} color="white" />
          </Pressable>

          <Text className="text-white font-medium px-3 py-1 rounded-full bg-black/35">
            {currentIndex + 1} of {mediaItems.length}
          </Text>

          <View className="w-10" />
        </View>
      </View>

      {/* Image Gallery */}
      <FlatList
        ref={flatListRef}
        data={mediaItems}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        initialScrollIndex={initialIndex}
        getItemLayout={(_, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
        onMomentumScrollEnd={(event) => {
          const offsetX = event.nativeEvent.contentOffset.x;
          const index = Math.round(offsetX / width);
          setCurrentIndex(index);
        }}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item, index }) => {
          if (item.type === 'video') {
            return (
              <VideoItem
                url={item.url}
                width={width}
                height={mediaHeight}
                isActive={currentIndex === index}
              />
            );
          }
          return (
            <View
              style={{ width, height }}
              className="items-center justify-center"
            >
              <Image
                source={{ uri: item.url }}
                style={{ width, height: mediaHeight }}
                contentFit="contain"
                cachePolicy="memory-disk"
                transition={200}
              />
            </View>
          );
        }}
      />
    </View>
  );
}
