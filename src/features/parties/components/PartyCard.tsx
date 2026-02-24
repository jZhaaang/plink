import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, View, Text } from 'react-native';
import { Image } from 'expo-image';
import AvatarStack from '../../../components/AvatarStack';
import { memo } from 'react';
import { StyleSheet } from 'react-native-unistyles';

interface Props {
  name: string;
  bannerUri?: string | null;
  members?: { avatarUrl?: string }[];
  onPress?: () => void;
}

function BannerFallback({ showIcon }: { showIcon?: boolean }) {
  return (
    <LinearGradient
      colors={['#bfdbfe', '#3b82f6']}
      start={{ x: 0, y: 1 }}
      end={{ x: 1, y: 0 }}
      style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
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
    <Pressable onPress={onPress}>
      <View style={styles.card}>
        <View style={styles.bannerWrap}>
          {bannerUri ? (
            <Image
              source={{ uri: bannerUri }}
              cachePolicy="memory-disk"
              contentFit="cover"
              style={{ width: '100%', height: '100%' }}
            />
          ) : (
            <BannerFallback showIcon={false} />
          )}
        </View>

        <View style={styles.infoPill}>
          <Text style={styles.partyName} numberOfLines={1}>
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

export default memo(PartyCard);

const styles = StyleSheet.create((theme) => ({
  card: {
    borderRadius: theme.radii.xl,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadows.md,
  },
  bannerWrap: {
    borderRadius: theme.radii.lg,
    overflow: 'hidden',
    aspectRatio: 2.5,
  },
  infoPill: {
    marginHorizontal: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: theme.radii.lg,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    marginTop: -20,
    marginBottom: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  partyName: {
    flex: 1,
    fontSize: theme.fontSizes.base,
    fontWeight: theme.fontWeights.semibold,
    color: theme.colors.textPrimary,
  },
}));
