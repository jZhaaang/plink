import {
  FlatList,
  Pressable,
  useWindowDimensions,
  View,
  Text,
} from 'react-native';
import { Image } from 'expo-image';
import { LinkPostMedia } from '../../../lib/models';

type Props = {
  media: LinkPostMedia[];
  columns?: number;
  maxItems?: number;
  scrollEnabled?: boolean;
  ListHeaderComponent?: React.ComponentType;
  ListFooterComponent?: React.ComponentType;
  onMediaPress?: (index: number) => void;
  onOverflowPress?: () => void;
};

const GAP = 3;

export default function MediaGrid({
  media,
  columns = 3,
  maxItems,
  scrollEnabled = true,
  ListHeaderComponent,
  ListFooterComponent,
  onMediaPress,
  onOverflowPress,
}: Props) {
  const { width } = useWindowDimensions();
  const itemSize = (width - 32 - GAP * (columns - 1)) / columns; // 32 = px-4 padding on both sides

  const hasOverflow = maxItems !== undefined && media.length > maxItems;
  const overflowCount = hasOverflow ? media.length - maxItems : 0;
  const displayedMedia = hasOverflow ? media.slice(0, maxItems) : media;

  return (
    <FlatList
      data={displayedMedia}
      numColumns={columns}
      scrollEnabled={scrollEnabled}
      keyExtractor={(item) => item.id}
      columnWrapperStyle={{ gap: GAP }}
      contentContainerStyle={{ gap: GAP, paddingHorizontal: 4 }}
      ListHeaderComponent={ListHeaderComponent}
      ListFooterComponent={ListFooterComponent}
      renderItem={({ item, index }) => {
        const isLastItem = hasOverflow && index === displayedMedia.length - 1;

        return (
          <Pressable
            onPress={() => {
              if (isLastItem && onOverflowPress) {
                onOverflowPress();
              } else {
                onMediaPress?.(index);
              }
            }}
            className="active:opacity-80"
          >
            <>
              <Image
                source={{ uri: item.url }}
                style={{
                  width: itemSize,
                  height: itemSize,
                  borderRadius: 12,
                }}
                contentFit="cover"
                cachePolicy="memory-disk"
                transition={200}
              />
              {isLastItem && (
                <View className="absolute inset-0 bg-black/60 items-center justify-center rounded-xl">
                  <Text className="text-white text-lg font-semibold">
                    +{overflowCount}
                  </Text>
                </View>
              )}
            </>
          </Pressable>
        );
      }}
      ListEmptyComponent={<View />}
    />
  );
}
