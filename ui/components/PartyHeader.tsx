import { PartyDetail } from '@/types/models';
import { Image, Text, View } from 'react-native';

type Props = {
  partyDetail: PartyDetail['party'];
};

export function PartyHeader({ partyDetail }: Props) {
  const { name, avatar_url: avatarUrl, banner_url: bannerUrl, members } = partyDetail;
  const memberAvatars = members.map((member) => member.avatar_url);

  return (
    <View className="relative bg-gray-100 mb-4 rounded-xl overflow-hidden">
      {bannerUrl && (
        <Image
          source={{ uri: bannerUrl }}
          className="absolute inset-0 w-full h-full opacity-20"
          resizeMode="cover"
        />
      )}
      <View className="flex-row items-center p-4">
        <Image source={{ uri: avatarUrl }} className="w-16 h-16 rounded-full mr-3" />
        <View>
          <Text className="text-xl font-bold">{name}</Text>
          <View className="flex-row mt-2 items-center">
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
  );
}
