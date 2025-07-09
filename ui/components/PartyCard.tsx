import { formatDistanceToNow } from 'date-fns';
import { Image, Pressable, Text, View } from 'react-native';

type Props = {
  partyName: string;
  avatarUrl: string;
  bannerUrl: string;
  recentLinkName?: string;
  recentLinkCreatedAt?: string;
  isActive?: boolean;
  onPress: () => void;
};

export function PartyCard({
  partyName,
  avatarUrl,
  bannerUrl,
  recentLinkName,
  recentLinkCreatedAt,
  isActive,
  onPress,
}: Props) {
  return (
    <Pressable onPress={onPress} className="rounded-xl overflow-hidden border border-gray-300 mb-4">
      <View className="relative bg-purple-100 p-4">
        <Image
          source={{ uri: bannerUrl }}
          className="absolute inset-0 w-full h-full opacity-10"
          resizeMode="cover"
        />
        <View className="flex-row items-center">
          <Image source={{ uri: avatarUrl }} className="w-10 h-10 rounded-full mr-3" />
          <View>
            <Text className="font-semibold text-base">{partyName}</Text>
            <Text className="text-xs text-gray-600">
              {recentLinkName && recentLinkCreatedAt
                ? `${recentLinkName} ${isActive ? ' is happening now!' : ` happened ${formatDistanceToNow(new Date(recentLinkCreatedAt))} ago`}`
                : 'No links yet'}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}
