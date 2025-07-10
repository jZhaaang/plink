import { PartyOverview } from '@/types/models';
import { formatDistanceToNow } from 'date-fns';
import { Image, Pressable, Text, View } from 'react-native';

type Props = {
  partyOverview: PartyOverview;
  onPress: () => void;
};

export function PartyOverviewCard({ partyOverview, onPress }: Props) {
  const {
    name: partyName,
    avatar_url: avatarUrl,
    banner_url: bannerUrl,
    members,
    recentLink,
  } = partyOverview;
  const memberAvatars = members.map((member) => member.avatar_url);

  return (
    <Pressable onPress={onPress} className="rounded-xl overflow-hidden border border-gray-300 mb-4">
      <View className="relative bg-gray-100">
        {bannerUrl && (
          <Image
            source={{ uri: bannerUrl }}
            className="absolute inset-0 w-full h-full opacity-25"
            resizeMode="cover"
          />
        )}
        <View className="flex-row items-center p-4">
          <Image source={{ uri: avatarUrl }} className="w-16 h-16 rounded-full mr-3" />
          <View>
            <Text className="text-xl font-semibold text-base">{partyName}</Text>
            <Text className="text-md text-gray-600">
              {recentLink
                ? `${recentLink.name} ${recentLink.is_active ? ' is happening now!' : ` happened ${formatDistanceToNow(new Date(recentLink.created_at))} ago`}`
                : 'No links yet'}
            </Text>
            <View className="flex-row mt-2">
              {memberAvatars.map((url, i) => (
                <Image
                  key={i}
                  source={{ uri: url }}
                  className={`w-8 h-8 rounded-full border-2 border-white ${i > 0 ? '-ml-3' : ''}`}
                />
              ))}
            </View>
          </View>
        </View>
      </View>
    </Pressable>
  );
}
