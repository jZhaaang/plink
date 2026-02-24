import { FlatList, useWindowDimensions, View, Text } from 'react-native';
import { LinkPostMedia } from '../../../lib/models';
import { Feather } from '@expo/vector-icons';
import MediaTile from '../../../components/MediaTile';
import { StyleSheet } from 'react-native-unistyles';

interface Props {
  media: LinkPostMedia[];
  columns?: number;
  maxItems?: number;
  scrollEnabled?: boolean;
  ListHeaderComponent?: React.ComponentType;
  ListFooterComponent?: React.ComponentType;
  onMediaPress?: (item: LinkPostMedia) => void;
  onOverflowPress?: () => void;
}

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
            uri={item.thumbnailUrl ?? item.url}
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
                  <View style={styles.overflowOverlay}>
                    <Text style={styles.overflowText}>+{overflowCount}</Text>
                  </View>
                );
              } else if (item.type === 'video') {
                return (
                  <View style={styles.videoOverlay}>
                    <View style={styles.playButton}>
                      <Feather
                        name="play"
                        size={20}
                        color="white"
                        style={{ marginLeft: 2 }}
                      />
                    </View>
                  </View>
                );
              }
            }}
          />
        );
      }}
      ListEmptyComponent={<View />}
    />
  );
}

const styles = StyleSheet.create((theme) => ({
  overflowOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radii.lg,
  },
  overflowText: {
    color: theme.colors.textInverse,
    fontSize: theme.fontSizes.lg,
    fontWeight: theme.fontWeights.semibold,
  },
  videoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: theme.radii.full,
    backgroundColor: theme.colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
  },
}));
