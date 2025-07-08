import { formatDistanceToNow } from 'date-fns';
import { Image, Text, View } from 'react-native';

type Props = {
  linkName: string;
  partyName: string;
  partyAvatar: string;
  createdAt: string;
  location: string;
  members: { name: string; avatar_url: string }[];
};

export default function LinkHeader({
  linkName,
  partyName,
  partyAvatar,
  createdAt,
  location,
  members,
}: Props) {
  return (
    <View className="mb-4 px-4 py-4 rounded-xl border border-gray-300 bg-white">
      {/* Party info*/}
      <View className="flex-row items-start mb-3">
        <Image
          source={{
            uri: partyAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(partyName)}`,
          }}
          className="w-10 h-10 rounded-full mr-2"
        />
        <View>
          <Text className="font-semibold">{partyName}</Text>
          <Text className="text-sm text-gray-600">{linkName}</Text>
        </View>
      </View>

      {/* Location and time */}
      <Text className="text-sm text-gray-500 mb-2">
        ⏱️ Started {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
        {'\n'}
        📍{location}
      </Text>

      {/* Member list */}
      <View className="flex-row flex-wrap items-center gap-y-1">
        {members.map((member, i) => (
          <View key={i} className="flex-row items-center mr-3 mb-1">
            <Image source={{ uri: member.avatar_url }} className="w-6 h-6 rounded-full mr-1" />
            <Text className="text-sm text-gray-800">{member.name}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
