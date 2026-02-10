import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, View, Text } from 'react-native';
import { Image } from 'expo-image';
import AvatarStack from '../../../components/AvatarStack';

type Props = {
  name: string;
  bannerUri?: string | null;
  members?: { avatarUrl?: string }[];
  onPress?: () => void;
};

function BannerFallback({ showIcon }: { showIcon?: boolean }) {
  return (
    <LinearGradient
      colors={['#bfdbfe', '#3b82f6']}
      start={{ x: 0, y: 1 }}
      end={{ x: 1, y: 0 }}
      className="flex-1 items-center justify-center"
    >
      {showIcon && (
        <MaterialIcons name="add-photo-alternate" size={36} color="#ffffff99" />
      )}
    </LinearGradient>
  );
}

export function PartyCard(props: Props) {
  const { name, bannerUri, members, onPress } = props;

  const memberAvatarUris =
    members?.map((m) => m.avatarUrl).filter((url): url is string => !!url) ??
    [];
  const memberCount = members?.length ?? 0;

  return (
    <Pressable onPress={onPress} className="mb-3">
      <View className="rounded-2xl bg-neutral-100 p-4 shadow-md">
        {/* Banner - inner rounded rect */}
        <View
          className="rounded-xl overflow-hidden"
          style={{ aspectRatio: 2.5 }}
        >
          {bannerUri ? (
            <Image
              source={{ uri: bannerUri }}
              contentFit="cover"
              style={{ width: '100%', height: '100%' }}
            />
          ) : (
            <BannerFallback showIcon={false} />
          )}
        </View>

        {/* Floating info pill */}
        <View
          className="mx-3 flex-row items-center rounded-xl bg-white px-4 py-3"
          style={{
            marginTop: -20,
            marginBottom: 4,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.08,
            shadowRadius: 4,
            elevation: 3,
          }}
        >
          <Text
            className="flex-1 text-base font-semibold text-neutral-900"
            numberOfLines={1}
          >
            {name}
          </Text>

          {memberCount > 0 && (
            <AvatarStack
              avatarUris={memberAvatarUris}
              maxVisible={3}
              size={22}
            />
          )}
        </View>
      </View>
    </Pressable>
  );
}

export default PartyCard;
