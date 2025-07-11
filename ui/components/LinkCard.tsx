import { PartyDetail } from '@/types/models';
import { formatDistanceToNow } from 'date-fns';
import { Image, Pressable, Text, View } from 'react-native';

type Props = {
  link: PartyDetail['links'][number];
  onPress: () => void;
};

export function LinkCard({ link, onPress }: Props) {
  const { name, created_at: createdAt, is_active: isActive, members, posts } = link;
  const memberAvatars = members.map((member) => member.avatar_url);
  const photos = posts.flatMap((post) => post.signed_image_urls).slice(0, 3);

  return (
    <Pressable onPress={onPress} className="border border-gray-300 rounded-xl mb-4 p-3 bg-white">
      <View className="flex-row justify-between items-center mb-2">
        <View>
          <Text className="text-base font-semibold">{name}</Text>
          <Text className="text-xs text-gray-500">Location</Text>
        </View>
        <View className="flex-row items-center">
          {memberAvatars.slice(0, 3).map((url, i) => (
            <Image
              key={i}
              source={{ uri: url }}
              className={`w-6 h-6 rounded-full border-2 border-white ${i > 0 ? '-ml-2' : ''}`}
            />
          ))}
          {memberAvatars.length > 3 && (
            <View className="w-6 h-6 ml-1 rounded-full bg-gray-300 border-2 border-white items-center justify-center">
              <Text className="text-xs font-semibold">+{memberAvatars.length - 3}</Text>
            </View>
          )}
        </View>
      </View>
      <View className="flex-row space-x-2 mb-2">
        {photos.map((url, i) => (
          <Image
            key={i}
            source={{ uri: url }}
            className="w-1/3 aspect-square rounded-lg bg-gray-200"
            resizeMode="cover"
          />
        ))}
      </View>
      <Text className="text-xs text-right text-gray-500">
        {isActive ? 'Ongoing' : `${formatDistanceToNow(new Date(createdAt))} ago`}
      </Text>
    </Pressable>
  );
}
