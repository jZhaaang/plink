import { LinkOverview } from '@/types/models';
import { formatDistanceToNow } from 'date-fns';
import { Image, Pressable, Text, View } from 'react-native';

type Props = {
  linkOverview: LinkOverview;
  onPress: () => void;
};

export function LinkOverviewCard({ linkOverview, onPress }: Props) {
  const { link, party, linkMembers, posts } = linkOverview;
  const memberAvatars = linkMembers.map((member) => member.avatar_url);
  const displayedAvatars = memberAvatars.slice(0, 3);
  const extraCount = memberAvatars.length - 3;

  const photoUrls = posts.flatMap((post) => post.signed_image_urls).slice(0, 3);

  return (
    <Pressable
      onPress={onPress}
      className="rounded-xl overflow-hidden border border-gray-300 mb-4 bg-white"
    >
      <View className="flex-row items-center justify-between p-4">
        <View className="flex-row items-center">
          <Image source={{ uri: party.avatar_url }} className="w-10 h-10 rounded-full mr-3" />
          <View>
            <Text className="font-semibold">{party.name}</Text>
            <Text className="text-sm text-gray-600">{link.name}</Text>
          </View>
        </View>
        <View className="flex-row items-center">
          {displayedAvatars.map((url, i) => (
            <Image
              key={i}
              source={{ uri: url }}
              className={`w-8 h-8 rounded-full border-2 border-white ${i > 0 ? '-ml-3' : ''}`}
            />
          ))}
          {extraCount > 0 && (
            <View className="-ml-3 w-8 h-8 rounded-full bg-gray-300 border-2 border-white items-center justify-center">
              <Text className="text-xs text-gray-700">+{extraCount}</Text>
            </View>
          )}
        </View>
      </View>

      <View className="flex-row justify-between px-4 pb-4">
        {photoUrls.map((uri, i) => (
          <Image
            key={i}
            source={{ uri }}
            className="w-[30%] aspect-[1/1] rounded-md bg-gray-200"
            resizeMode="cover"
          />
        ))}
      </View>

      <View className="flex-row justify-between items-center px-4 pb-4">
        <View className="px-3 py-1 bg-gray-200 rounded-full">
          <Text className="text-xs text-gray-800">
            {link.is_active
              ? 'Ongoing'
              : formatDistanceToNow(new Date(link.created_at), { addSuffix: true })}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
