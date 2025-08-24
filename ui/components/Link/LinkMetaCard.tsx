import { formatTimestamp } from '@/lib/utils';
import { LinkOverview } from '@/types/models';
import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Menu } from 'react-native-paper';
import { Avatar } from '../Avatar';

type Props = {
  linkOverview: LinkOverview;
  onPressInviteMembers?: () => void;
  onPressEditLink?: () => void;
  onPressEndLink?: () => void;
  onPressDeleteLink?: () => void;
};

export function LinkMetaCard({
  linkOverview,
  onPressInviteMembers,
  onPressEditLink,
  onPressEndLink,
  onPressDeleteLink,
}: Props) {
  const [visible, setVisible] = useState(false);
  const { link, party, linkMembers } = linkOverview;

  const memberNames = linkMembers.map((m) => m.name).join(', ');
  const timestamp = formatTimestamp(link.created_at);

  return (
    <View className="rounded-xl bg-gray-100 p-4 mb-4">
      <View className="flex-row justify-between items-start">
        <View className="flex-row items-center">
          <Avatar uri={party.avatar_url} size={56} border={1} style={{ marginRight: 8 }} />
          <View>
            <Text className="text-lg font-bold text-gray-900">{link.name}</Text>
            <Text className="text-lg text-gray-600">
              with <Text className="font-medium">{party.name}</Text>
            </Text>
          </View>
        </View>
      </View>

      <View className="mt-4 space-y-1">
        {link.location && (
          <View className="flex-row items-center p-1">
            <Feather name="map-pin" size={20} color="gray" />
            <Text className="ml-2 text-sm text-gray-700">{link.location}</Text>
          </View>
        )}
        <View className="flex-row items-center p-1">
          <Feather name="clock" size={20} color="gray" />
          <Text className="ml-2 text-sm text-gray-700">Started {timestamp}</Text>
        </View>
        <View className="flex-row items-center p-1">
          <Feather name="users" size={20} color="gray" />
          <Text className="ml-2 text-sm text-gray-700">{memberNames}</Text>
        </View>
      </View>

      <View className="absolute right-4 top-8">
        <Menu
          visible={visible}
          onDismiss={() => setVisible(false)}
          anchor={
            <Pressable onPress={() => setVisible(true)}>
              <Feather name="more-vertical" size={28} color="black" />
            </Pressable>
          }
        >
          <Menu.Item onPress={onPressInviteMembers} title="Invite Members" />
          {link.is_active && <Menu.Item onPress={onPressEditLink} title="Edit Link" />}
          <Menu.Item onPress={onPressEndLink} title="End Link" />
          <Menu.Item
            onPress={onPressDeleteLink}
            title="Delete Link"
            titleStyle={{ color: 'red' }}
          />
        </Menu>
      </View>
    </View>
  );
}
