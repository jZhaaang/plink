import { Feather, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Image, ImageBackground, Pressable, View, Text } from 'react-native';
import AvatarStack from '../../../components/AvatarStack';
import { formatRelativeTime } from '../../../lib/utils/formatRelativeTime';

type BaseProps = {
  name: string;
  avatarUri?: string | null;
  bannerUri?: string | null;
};

type CompactProps = BaseProps & {
  variant: 'compact';
  onPress?: () => void;
  members?: { avatarUrl?: string }[];
  hasActiveLink?: boolean;
  lastActivityAt?: string | null;
};

type ExpandedProps = BaseProps & {
  variant: 'expanded';
};

type EditableProps = BaseProps & {
  variant: 'editable';
  onPressAvatar?: () => void;
  onPressBanner?: () => void;
};

type Props = CompactProps | ExpandedProps | EditableProps;

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

function AvatarFallback({ showIcon }: { showIcon?: boolean }) {
  return (
    <LinearGradient
      colors={['#93c5fd', '#a7f3d0']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className="flex-1 items-center justify-center"
    >
      {showIcon && (
        <MaterialIcons name="add-a-photo" size={28} color="#ffffff99" />
      )}
    </LinearGradient>
  );
}

export function PartyCard(props: Props) {
  const { variant, name, avatarUri, bannerUri } = props;
  const isEditable = variant === 'editable';
  const isCompact = variant === 'compact';

  // Compact-only props
  const members = isCompact ? props.members : undefined;
  const hasActiveLink = isCompact ? props.hasActiveLink : undefined;
  const lastActivityAt = isCompact ? props.lastActivityAt : undefined;
  const memberAvatarUris =
    members?.map((m) => m.avatarUrl).filter((url): url is string => !!url) ??
    [];
  const memberCount = members?.length ?? 0;

  const handlePress = () => {
    if (variant === 'compact' && props.onPress) {
      props.onPress();
    }
  };

  const handleAvatarPress = () => {
    if (variant === 'editable' && props.onPressAvatar) {
      props.onPressAvatar();
    }
  };

  const handleBannerPress = () => {
    if (variant === 'editable' && props.onPressBanner) {
      props.onPressBanner();
    }
  };

  // Compact variant: card with banner and content below
  if (isCompact) {
    const compactContent = (
      <View className="rounded-2xl overflow-hidden bg-white shadow-md">
        {/* Banner */}
        <View className="h-28 w-full overflow-hidden">
          {bannerUri ? (
            <ImageBackground
              source={{ uri: bannerUri }}
              resizeMode="cover"
              className="flex-1"
            >
              <View className="flex-1 bg-black/10" />
            </ImageBackground>
          ) : (
            <BannerFallback showIcon={false} />
          )}
          {/* Active link indicator */}
          {hasActiveLink && (
            <View className="absolute top-2 right-2 w-3 h-3 rounded-full bg-green-500 border-2 border-white" />
          )}
        </View>

        {/* Content row below banner */}
        <View className="flex-row items-center px-3.5 py-3">
          {/* Avatar */}
          <View
            style={{ width: 52, height: 52 }}
            className="rounded-full overflow-hidden border-2 border-white bg-white shadow-sm"
          >
            {avatarUri ? (
              <Image
                source={{ uri: avatarUri }}
                resizeMode="cover"
                className="flex-1"
              />
            ) : (
              <AvatarFallback showIcon={false} />
            )}
          </View>

          {/* Center: Name and activity */}
          <View className="flex-1 ml-3">
            <Text
              className="text-lg font-semibold text-neutral-900"
              numberOfLines={1}
            >
              {name}
            </Text>
            <Text className="text-sm text-slate-400">
              {formatRelativeTime(lastActivityAt ?? null)}
            </Text>
          </View>

          {/* Right: Member avatars and count */}
          {memberCount > 0 && (
            <View className="flex-row items-center ml-2 gap-2">
              <AvatarStack
                avatarUris={memberAvatarUris}
                maxVisible={3}
                size={22}
              />
              <View className="flex-row items-center">
                <Feather name="users" size={14} color="#64748b" />
                <Text className="text-sm text-slate-500 ml-1">
                  {memberCount}
                </Text>
              </View>
            </View>
          )}
        </View>
      </View>
    );

    return (
      <Pressable onPress={handlePress} className="mb-3">
        {compactContent}
      </Pressable>
    );
  }

  // Expanded/Editable variants: card with banner and content below (matching compact style)
  const isExpanded = variant === 'expanded';
  const bannerHeightClass = isExpanded ? 'h-36' : 'h-32';
  const avatarSize = isExpanded ? 64 : 52;
  const nameTextClass = isExpanded ? 'text-xl' : 'text-lg';

  const content = (
    <View className="rounded-2xl overflow-hidden bg-white shadow-md">
      {/* Banner */}
      <Pressable
        onPress={handleBannerPress}
        disabled={!isEditable}
        className={`${bannerHeightClass} w-full overflow-hidden`}
      >
        {bannerUri ? (
          <ImageBackground
            source={{ uri: bannerUri }}
            resizeMode="cover"
            className="flex-1"
          >
            <View className="flex-1 bg-black/10" />
          </ImageBackground>
        ) : (
          <BannerFallback showIcon={isEditable} />
        )}
      </Pressable>

      {/* Content row below banner */}
      <View className="flex-row items-center px-4 py-3">
        {/* Avatar */}
        <Pressable onPress={handleAvatarPress} disabled={!isEditable}>
          <View
            style={{ width: avatarSize, height: avatarSize }}
            className="rounded-full overflow-hidden border-2 border-white bg-white shadow-sm"
          >
            {avatarUri ? (
              <Image
                source={{ uri: avatarUri }}
                resizeMode="cover"
                className="flex-1"
              />
            ) : (
              <AvatarFallback showIcon={isEditable} />
            )}
          </View>
        </Pressable>

        {/* Name */}
        <View className="flex-1 ml-3">
          <Text
            className={`${nameTextClass} font-semibold text-neutral-900`}
            numberOfLines={2}
          >
            {name}
          </Text>
        </View>
      </View>
    </View>
  );

  return content;
}

export default PartyCard;
