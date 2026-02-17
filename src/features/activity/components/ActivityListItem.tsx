import { Feather } from '@expo/vector-icons';
import { ActivityFeedItem } from '../../../lib/models';
import { Pressable, View, Text } from 'react-native';
import { activityLine } from '../hooks/useActivityFeed';
import { formatRelativeTime } from '../../../lib/utils/formatTime';
import { memo } from 'react';

type Props = {
  item: ActivityFeedItem;
  onPress?: () => void;
};

function iconForType(
  type: ActivityFeedItem['type'],
): keyof typeof Feather.glyphMap {
  switch (type) {
    case 'link_created':
      return 'plus-circle';
    case 'link_ended':
      return 'check-circle';
    case 'link_member_joined':
      return 'user-plus';
    case 'link_member_left':
      return 'user-minus';
    case 'party_member_joined':
      return 'users';
    case 'party_member_left':
      return 'user-x';
    default:
      return 'bell';
  }
}

export function ActivityListItem({ item, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      className="rounded-2xl border border-slate-200 bg-white px-4 py-3 mb-2 active:opacity-80"
    >
      <View className="flex-row items-start">
        <View className="w-9 h-9 rounded-full bg-blue-50 items-center justify-center mr-3">
          <Feather name={iconForType(item.type)} size={16} color="#2563eb" />
        </View>

        <View className="flex-1">
          <Text className="text-[15px] font-medium text-slate-900">
            {activityLine(item)}
          </Text>
          <Text className="text-xs text-slate-400 mt-1">
            {formatRelativeTime(item.created_at)}
          </Text>
        </View>

        {!item.read_at ? (
          <View className="w-2 h-2 rounded-full bg-blue-500 mt-1" />
        ) : null}
      </View>
    </Pressable>
  );
}

export default memo(ActivityListItem);
