import { formatTimestamp } from '@/lib/utils';
import { LinkOverview } from '@/types/models';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, Text, View } from 'react-native';
import { MemberAvatarStack } from '../MemberAvatarStack';
import { PartyAvatar } from '../Party/PartyAvatar';
import { PhotoGrid } from '../PhotoGrid';

type Props = {
  linkOverview: LinkOverview;
  onPress: (partyId: string, linkId: string) => void;
  showPartyInfo?: boolean;
};

export function LinkCard({ linkOverview, onPress, showPartyInfo }: Props) {
  const { link, party, linkMembers, posts } = linkOverview;

  const memberAvatars = linkMembers.map((m) => m.avatar_url).slice(0, 3);

  const photoUrls = posts.flatMap((p) => p.signed_image_urls).slice(0, 3);
  const photoCount = posts.reduce((acc, p) => acc + p.signed_image_urls.length, 0);
  const commentCount = posts.length;

  const timestamp = formatTimestamp(link.created_at);

  const isActive = link.is_active;

  const CardInner = (
    <>
      <View className="flex-row items-center justify-between p-4">
        <View className="flex-row items-center">
          {showPartyInfo && (
            <PartyAvatar uri={party.avatar_url} size={48} border={2} style={{ marginRight: 8 }} />
          )}
          <View>
            {showPartyInfo && <Text className="font-semibold text-gray-900">{party.name}</Text>}
            <Text
              className={`text-gray-600 ${!showPartyInfo ? 'font-semibold text-gray-900 ml-2' : 'text-sm'}`}
            >
              {link.name}
            </Text>
          </View>
        </View>

        <MemberAvatarStack uris={memberAvatars} />
      </View>

      <View className="flex-row gap-2 px-4 pb-2">
        <PhotoGrid uris={photoUrls} />
      </View>

      <View className="flex-row items-center justify-between px-4 pb-4">
        <View className="flex-row items-center w-20">
          <View className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
          <Text
            className={`ml-1 text-s font-semibold ${isActive ? 'text-green-700' : 'text-gray-500'}`}
          >
            {isActive ? 'LIVE' : 'ENDED'}
          </Text>
        </View>

        <View className="flex-row items-center space-x-4 flex-1 pl-4">
          <View className="flex-row items-center space-x-1 px-1">
            <Feather name="image" size={20} color="black" />
            <Text className="text-s text-black px-1">{photoCount}</Text>
          </View>
          <View className="flex-row items-center space-x-1 px-1">
            <Feather name="message-circle" size={20} color="black" />
            <Text className="text-s text-black px-1">{commentCount}</Text>
          </View>
        </View>

        <Text className="text-s text-gray-500 w-30 text-right">{timestamp}</Text>
      </View>
    </>
  );

  return (
    <Pressable
      onPress={() => onPress(party.id, link.id)}
      className="mb-4 rounded-xl overflow-hidden"
    >
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
        <LinearGradient
          colors={['#f3f4f6', '#e5e7eb']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="border border-gray-200"
        >
          {CardInner}
        </LinearGradient>
      )}
    </Pressable>
  );
}
