import { PartyOverview } from '@/types/models';
import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Menu } from 'react-native-paper';
import { PartyAvatar } from './PartyAvatar';
import { PartyBanner } from './PartyBanner';

type Props = {
  partyOverview: PartyOverview;
};

export function PartyHeader({ partyOverview }: Props) {
  const [visible, setVisible] = useState(false);

  return (
    <View className="relative bg-gray-100 rounded-xl overflow-hidden m-4">
      <PartyBanner uri={partyOverview.party.banner_url} />

      <View className="absolute right-4 top-32">
        <Menu
          visible={visible}
          onDismiss={() => setVisible(false)}
          anchor={
            <Pressable onPress={() => setVisible(true)}>
              <Feather name="more-vertical" size={28} color="black" />
            </Pressable>
          }
        >
          <Menu.Item onPress={() => {}} title="Edit Party" />
          <Menu.Item onPress={() => {}} title="Invite Members" />
          <Menu.Item onPress={() => {}} title="Leave Party" />
        </Menu>
      </View>

      <View className="relative px-4 pt-6 pb-4">
        <PartyAvatar
          uri={partyOverview.party.avatar_url}
          size={60}
          style={{
            position: 'absolute',
            top: -28,
            left: 16,
          }}
        />

        <View className="ml-20 justify-start max-w-[60%]">
          <Text className="font-semibold text-gray-900 text-xl -mt-2">
            {partyOverview.party.name}
          </Text>
        </View>

        <Text className="font-semibold text-gray-900 text-l mt-2">Members</Text>
        <View className="mt-2 space-y-2">
          {partyOverview.partyMembers.map((member) => (
            <View key={member.id} className="flex-row items-center">
              <PartyAvatar uri={member.avatar_url} size={24} border={1} />
              <Text className="ml-2 text-gray-800 text-base">{member.name}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}
