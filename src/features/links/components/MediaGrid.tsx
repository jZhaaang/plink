import { FlatList, Pressable, useWindowDimensions, View } from 'react-native';
import { Image } from 'expo-image';
import { LinkPostMediaResolved } from '../../../lib/models';

type Props = {
  media: LinkPostMediaResolved[];
  onMediaPress?: (index: number) => void;
  columns?: number;
};

const GAP = 2;

export default function MediaGrid({ media, onMediaPress, columns = 3 }: Props) {
  const { width } = useWindowDimensions();
  const itemSize = (width - 32 - GAP * (columns - 1)) / columns; // 32 = px-4 padding on both sides

  return (
    <FlatList
      data={media}
      numColumns={columns}
      scrollEnabled={false}
      keyExtractor={(item) => item.id}
      columnWrapperStyle={{ gap: GAP }}
      contentContainerStyle={{ gap: GAP }}
      renderItem={({ item, index }) => (
        <Pressable
          onPress={() => onMediaPress?.(index)}
          className="active:opacity-80"
        >
          <Image
            source={{ uri: item.url }}
            style={{
              width: itemSize,
              height: itemSize,
              borderRadius: 4,
            }}
            contentFit="cover"
            cachePolicy="memory-disk"
            transition={200}
          />
        </Pressable>
      )}
      ListEmptyComponent={<View />}
    />
  );
}
