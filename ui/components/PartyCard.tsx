import { formatDistanceToNow } from 'date-fns';
import { Image, Pressable, Text, View } from 'react-native';

type Props = {
  partyName: string;
  avatarUrl: string;
  bannerUrl?: string;
  memberAvatars: string[];
  recentLinkName?: string;
  recentLinkCreatedAt?: string;
  isActive?: boolean;
  onPress: () => void;
};

export function PartyCard({
  partyName,
  avatarUrl,
  bannerUrl,
  memberAvatars,
  recentLinkName,
  recentLinkCreatedAt,
  isActive,
  onPress,
}: Props) {
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
              {recentLinkName && recentLinkCreatedAt
                ? `${recentLinkName} ${isActive ? ' is happening now!' : ` happened ${formatDistanceToNow(new Date(recentLinkCreatedAt))} ago`}`
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
