import { LinkOverview } from '@/types/models';
import { differenceInHours, format, formatDistanceToNow } from 'date-fns';
import { LinearGradient } from 'expo-linear-gradient';
import { Image, Pressable, Text, View } from 'react-native';

type Props = {
  linkOverview: LinkOverview;
  onPress: () => void;
};

export function LinkOverviewCard({ linkOverview, onPress }: Props) {
  const { link, party, linkMembers, posts } = linkOverview;

  const memberAvatars = linkMembers.map((m) => m.avatar_url).slice(0, 3);
  const extraCount = linkMembers.length - 3;

  const photoUrls = posts.flatMap((p) => p.signed_image_urls).slice(0, 3);
  const photoCount = posts.reduce((acc, p) => acc + p.signed_image_urls.length, 0);
  const commentCount = posts.length;

  const linkDate = new Date(link.created_at);
  const hoursAgo = differenceInHours(new Date(), linkDate);
  const timestamp =
    hoursAgo < 24
      ? formatDistanceToNow(linkDate, { addSuffix: true })
      : format(linkDate, 'dd/MM/yyyy');

  const isActive = link.is_active;

  const CardInner = (
    <>
      <View className="flex-row items-center justify-between p-4">
        <View className="flex-row items-center">
          <Image source={{ uri: party.avatar_url }} className="w-10 h-10 rounded-full mr-3" />
          <View>
            <Text className="font-semibold text-gray-900">{party.name}</Text>
            <Text className="text-sm text-gray-600">{link.name}</Text>
          </View>
        </View>
        <View className="flex-row items-center">
          {memberAvatars.map((url, i) => (
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

      <View className="flex-row justify-between px-4 pb-2 space-x-2">
        {photoUrls.map((uri, i) => (
          <Image
            key={i}
            source={{ uri }}
            className="flex-1 aspect-square rounded-md bg-gray-200"
            resizeMode="cover"
          />
        ))}
      </View>

      <View className="flex-row justify-between items-center px-4 pb-4">
        <View className="flex-row items-center space-x-1">
          <View className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
          <Text
            className={`text-xs font-semibold ${isActive ? 'text-green-700' : 'text-gray-500'}`}
          >
            {isActive ? ' LIVE' : ' ENDED'}
          </Text>
        </View>
        <Text className="text-xs text-gray-500 -ml-56">
          🖼 {photoCount} · 💬 {commentCount}
        </Text>
        <Text className="text-xs text-gray-500">{timestamp}</Text>
      </View>
    </>
  );

  return (
    <Pressable onPress={onPress} className="mb-4 rounded-xl overflow-hidden">
      {isActive ? (
        <LinearGradient
          colors={['#d1fae5', '#abe1c8']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="border border-green-200"
        >
          {CardInner}
        </LinearGradient>
      ) : (
        <View className="bg-white border border-gray-200">{CardInner}</View>
      )}
    </Pressable>
  );
}
