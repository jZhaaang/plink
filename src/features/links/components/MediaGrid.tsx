import { FlatList, useWindowDimensions, View, Text } from 'react-native';
import { LinkPostMedia } from '../../../lib/models';
import { Feather } from '@expo/vector-icons';
import MediaTile from '../../../components/MediaTile';

type Props = {
  media: LinkPostMedia[];
  columns?: number;
  maxItems?: number;
  scrollEnabled?: boolean;
  ListHeaderComponent?: React.ComponentType;
  ListFooterComponent?: React.ComponentType;
  onMediaPress?: (item: LinkPostMedia) => void;
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
  const itemSize = (width - 32 - GAP * (columns - 1)) / columns;

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
          <MediaTile
            uri={item.url}
            width={itemSize}
            height={itemSize}
            onPress={() => {
              if (isLastItem && onOverflowPress) {
                onOverflowPress();
              } else {
                onMediaPress?.(item);
              }
            }}
            renderOverlay={(isLoaded) => {
              if (!isLoaded) return null;

              if (isLastItem) {
                return (
                  <View className="absolute inset-0 bg-black/60 items-center justify-center rounded-xl">
                    <Text className="text-white text-lg font-semibold">
                      +{overflowCount}
                    </Text>
                  </View>
                );
              } else if (item.type === 'video') {
                <View className="absolute inset-0 items-center justify-center">
                  <View className="w-10 h-10 rounded-full bg-black/50 items-center justify-center">
                    <Feather
                      name="play"
                      size={20}
                      color="white"
                      className="ml-1"
                    />
                  </View>
                </View>;
              }
            }}
          />
        );
      }}
      ListEmptyComponent={<View />}
    />
  );
}
