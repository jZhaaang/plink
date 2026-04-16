import { View, Pressable, GestureResponderEvent } from 'react-native';
import { Image } from 'expo-image';
import { LinkPostMedia, LinkPostWithMedia } from '../../../lib/models';
import { useState } from 'react';
import { Feather } from '@expo/vector-icons';
import {
  Card,
  CardSection,
  DropdownMenu,
  DropdownMenuItem,
  MediaGrid,
  Text,
} from '../../../components';
import { formatRelativeTime } from '../../../lib/utils/formatTime';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface Props {
  post: LinkPostWithMedia;
  onMediaPress?: (item: LinkPostMedia) => void;
  currentUserId?: string;
  onDeletePost?: (postId: string) => void;
}

export default function PostCard({
  post,
  onMediaPress,
  currentUserId,
  onDeletePost,
}: Props) {
  const { theme } = useUnistyles();

  const [menuVisible, setMenuVisible] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<{ x: number; y: number } | null>(
    null,
  );

  const isPostOwner = currentUserId === post.owner_id;
  const mediaCount = post.media.length;

  const handleMenuPress = (event: GestureResponderEvent) => {
    event.currentTarget.measureInWindow(
      (x: number, y: number, width: number, height: number) => {
        setMenuAnchor({ x: x + width, y: y + height });
        setMenuVisible(true);
      },
    );
  };

  const handleDelete = () => {
    setMenuVisible(false);
    onDeletePost?.(post.id);
  };

  return (
    <Card style={styles.card}>
      <CardSection>
        {/* Post Header */}
        <View style={styles.headerRow}>
          {post.owner.avatarUrl ? (
            <Image
              source={{ uri: post.owner.avatarUrl }}
              cachePolicy="memory-disk"
              style={styles.avatar}
              contentFit="cover"
            />
          ) : (
            <View style={[styles.avatar, styles.avatarFallback]}>
              <Text variant="labelMd" color="primary">
                {post.owner.name?.charAt(0).toUpperCase() ?? '?'}
              </Text>
            </View>
          )}
          <View style={styles.headerTextWrap}>
            <Text variant="labelMd" color="primary">
              {post.owner.name ?? 'Unknown'}
            </Text>
            <Text variant="bodySm" color="tertiary">
              {formatRelativeTime(post.created_at)}
            </Text>
          </View>

          {isPostOwner && onDeletePost && (
            <Pressable
              onPress={handleMenuPress}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <View style={styles.menuButton}>
                <Feather
                  name="more-horizontal"
                  size={theme.iconSizes.md}
                  color={theme.colors.gray}
                />
              </View>
            </Pressable>
          )}
        </View>

        {/* Media Grid */}
        {mediaCount > 0 && (
          <>
            <MediaGrid
              media={post.media}
              columns={3}
              scrollEnabled={false}
              onMediaPress={onMediaPress}
            />
            <Text variant="bodySm" color="tertiary" style={styles.mediaCount}>
              {mediaCount} item{mediaCount > 1 ? 's' : ''}
            </Text>
          </>
        )}

        <DropdownMenu
          visible={menuVisible}
          onClose={() => setMenuVisible(false)}
          anchor={menuAnchor}
        >
          <DropdownMenuItem
            icon="trash-2"
            label="Delete Post"
            onPress={handleDelete}
            variant="danger"
          />
        </DropdownMenu>
      </CardSection>
    </Card>
  );
}

const styles = StyleSheet.create((theme) => ({
  card: {
    marginBottom: theme.spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  avatar: {
    width: theme.avatarSizes.md,
    height: theme.avatarSizes.md,
    borderRadius: theme.radii.full,
  },
  avatarFallback: {
    backgroundColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextWrap: {
    marginLeft: theme.spacing.md,
    flex: 1,
  },
  menuButton: {
    padding: theme.spacing.sm,
    marginRight: -theme.spacing.sm,
    borderRadius: theme.radii.full,
  },
  mediaCount: {
    marginTop: theme.spacing.sm,
  },
}));
