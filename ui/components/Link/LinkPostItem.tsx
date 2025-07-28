import { formatTimestamp } from '@/lib/utils';
import { LinkPostWithUrls } from '@/types/models';
import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Menu } from 'react-native-paper';
import { Avatar } from '../Avatar';
import { PhotoGrid } from '../PhotoGrid';

type Props = {
  post: LinkPostWithUrls;
  currentUserId: string;
};

export function LinkPostItem({ post, currentUserId }: Props) {
  const [visible, setVisible] = useState(false);
  const isOwner = post.user_id === currentUserId;
  const timestamp = formatTimestamp(post.created_at);
  const photoCount = post.signed_image_urls.length;
  const hasImage = photoCount > 0;

  const actionText = hasImage
    ? `added ${photoCount} photo${photoCount > 1 ? 's' : ''}`
    : 'commented';

  return (
    <View className="mb-4 border border-gray-300 rounded-xl p-3 bg-white">
      <View className="flex-row items-center mb-2">
        <Avatar uri={post.users.avatar_url} size={32} border={2} style={{ marginRight: 8 }} />
        <Text className="font-semibold text-gray-900">
          {post.users.name}
          <Text className="text-sm text-gray-500"> {actionText}</Text>
        </Text>
      </View>

      {post.comment && <Text className="text-gray-800 mb-2">{post.comment}</Text>}

      <View className="flex-row gap-2 px-6 pb-2">
        {hasImage && <PhotoGrid uris={post.signed_image_urls} />}
      </View>

      <Text className="text-xs text-gray-500 mt-2 text-right">{timestamp}</Text>

      {isOwner && (
        <View className="absolute right-4 top-6">
          <Menu
            visible={visible}
            onDismiss={() => setVisible(false)}
            anchor={
              <Pressable onPress={() => setVisible(true)}>
                <Feather name="more-vertical" size={20} color="black" />
              </Pressable>
            }
          >
            <Menu.Item onPress={() => {}} title="Edit Post" />
            <Menu.Item onPress={() => {}} title="Delete Post" titleStyle={{ color: 'red' }} />
          </Menu>
        </View>
      )}
    </View>
  );
}
