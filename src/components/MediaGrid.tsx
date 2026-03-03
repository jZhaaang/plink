import { FlatList, View, Text, LayoutChangeEvent } from 'react-native';
import { LinkPostMedia } from '../lib/models';
import { Feather } from '@expo/vector-icons';
import MediaTile from './MediaTile';
import { StyleSheet } from 'react-native-unistyles';
import { useState } from 'react';

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
  const [containerWidth, setContainerWidth] = useState(0);
  const itemSize = (containerWidth - GAP * (columns - 1)) / columns;
  const playButtonSize = containerWidth * 0.1;

  const handleLayout = (e: LayoutChangeEvent) => {
    setContainerWidth(e.nativeEvent.layout.width);
  };

  if (containerWidth === 0) {
    return <View onLayout={handleLayout} style={{ flex: 1 }} />;
  }

  const hasOverflow = maxItems !== undefined && media.length > maxItems;
  const overflowCount = hasOverflow ? media.length - maxItems : 0;
  const displayedMedia = hasOverflow ? media.slice(0, maxItems) : media;

  const renderTile = (item: LinkPostMedia, index: number) => {
    const isLastItem = hasOverflow && index === displayedMedia.length - 1;
    return (
      <MediaTile
        key={index}
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
                <View style={styles.playButton(playButtonSize)}>
                  <Feather
                    name="play"
                    size={playButtonSize * 0.5}
                    color="white"
                    style={{ marginLeft: 3 }}
                  />
                </View>
              </View>
            );
          }
        }}
      />
    );
  };

  if (!scrollEnabled) {
    return (
      <View onLayout={handleLayout} style={styles.scrollDisabledContainer}>
        {containerWidth > 0 &&
          displayedMedia.map((item, index) => renderTile(item, index))}
      </View>
    );
  }

  return (
    <FlatList
      data={displayedMedia}
      numColumns={columns}
      keyExtractor={(item) => item.id}
      columnWrapperStyle={{ gap: GAP }}
      contentContainerStyle={{ gap: GAP }}
      ListHeaderComponent={ListHeaderComponent}
      ListFooterComponent={ListFooterComponent}
      renderItem={({ item, index }) => renderTile(item, index)}
      ListEmptyComponent={<View />}
    />
  );
}

const styles = StyleSheet.create((theme) => ({
  scrollDisabledContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GAP,
  },
  overflowOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.overlay,
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
  playButton: (size: number) => ({
    width: size,
    height: size,
    borderRadius: theme.radii.full,
    backgroundColor: theme.colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
  }),
}));
