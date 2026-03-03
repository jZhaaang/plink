import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, View, Text } from 'react-native';
import { Image } from 'expo-image';
import { StyleSheet } from 'react-native-unistyles';
import { AvatarStack } from '../../../components';

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

export default function PartyCard(props: Props) {
  const { name, bannerUri, members, onPress } = props;

  const memberAvatarUris =
    members?.map((m) => m.avatarUrl).filter((url): url is string => !!url) ??
    [];
  const memberCount = members?.length ?? 0;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
    >
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

const styles = StyleSheet.create((theme) => ({
  card: {
    borderRadius: theme.radii.lg,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
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
    paddingVertical: theme.spacing.sm,
    marginTop: -theme.spacing.lg,
    marginBottom: theme.spacing.xs,
    ...theme.shadows.md,
  },
  partyName: {
    flex: 1,
    fontSize: theme.fontSizes.base,
    fontWeight: theme.fontWeights.semibold,
    color: theme.colors.textPrimary,
  },
}));
