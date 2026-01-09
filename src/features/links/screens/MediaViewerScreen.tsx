import { useRef, useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  View,
  Text,
  FlatList,
  Image,
  Pressable,
  useWindowDimensions,
  StatusBar,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

import { PartyStackParamList } from '../../../navigation/types';

type Props = NativeStackScreenProps<PartyStackParamList, 'MediaViewer'>;

export default function MediaViewerScreen({ route, navigation }: Props) {
  const { mediaUrls, initialIndex } = route.params;
  const { width, height } = useWindowDimensions();
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const flatListRef = useRef<FlatList>(null);

  const handleScroll = (event) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / width);
    setCurrentIndex(index);
  };

  return (
    <View className="flex-1 bg-black">
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View className="absolute top-0 left-0 right-0 z-10 pt-12 px-4 pb-4">
        <View className="flex-row items-center justify-between">
          <Pressable
            onPress={() => navigation.goBack()}
            className="p-2 -ml-2 bg-black/30 rounded-full"
          >
            <Feather name="x" size={24} color="white" />
          </Pressable>
          <Text className="text-white font-medium">
            {currentIndex + 1} of {mediaUrls.length}
          </Text>
          <View className="w-10" />
        </View>
      </View>

      {/* Image Gallery */}
      <FlatList
        ref={flatListRef}
        data={mediaUrls}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        initialScrollIndex={initialIndex}
        getItemLayout={(_, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item }) => (
          <View
            style={{ width, height }}
            className="items-center justify-center"
          >
            <Image
              source={{ uri: item }}
              style={{ width, height }}
              resizeMode="contain"
            />
          </View>
        )}
      />
    </View>
  );
}
