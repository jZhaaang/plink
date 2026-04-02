import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { View } from 'react-native';
import { Image } from 'expo-image';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { AvatarStack, Card, Text } from '../../../components';

interface Props {
  name: string;
  avatarUri?: string | null;
  bannerUri?: string | null;
  members?: { avatarUrl?: string }[];
  onPress?: () => void;
}

function BannerFallback({ showIcon }: { showIcon?: boolean }) {
  const { theme } = useUnistyles();

  return (
    <LinearGradient
      colors={['#bfdbfe', '#3b82f6']}
      start={{ x: 0, y: 1 }}
      end={{ x: 1, y: 0 }}
      style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
    >
      {showIcon && (
        <MaterialIcons
          name="add-photo-alternate"
          size={theme.iconSizes.xl}
          color={theme.colors.white}
        />
      )}
    </LinearGradient>
  );
}

export default function PartyCard({
  name,
  avatarUri,
  bannerUri,
  members,
  onPress,
}: Props) {
  const { theme } = useUnistyles();

  const memberAvatarUris =
    members?.map((m) => m.avatarUrl).filter((url): url is string => !!url) ??
    [];
  const memberCount = members?.length ?? 0;

  return (
    <Card onPress={onPress} style={styles.card}>
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

      <View style={styles.infoRow}>
        {avatarUri ? (
          <Image
            source={{ uri: avatarUri }}
            cachePolicy="memory-disk"
            contentFit="cover"
            style={styles.partyAvatar}
          />
        ) : (
          <View style={styles.partyAvatar}>
            <MaterialIcons
              name="group"
              size={theme.iconSizes.md}
              color={theme.colors.gray}
            />
          </View>
        )}

        <View style={styles.infoPill}>
          <Text variant="headingMd" color="primary" numberOfLines={1}>
            {name}
          </Text>
          {memberCount > 0 && (
            <AvatarStack
              avatarUris={memberAvatarUris}
              maxVisible={3}
              size={theme.avatarSizes.xs}
            />
          )}
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create((theme) => ({
  card: {
    marginBottom: theme.spacing.md,
    overflow: 'hidden',
    ...theme.shadows.md,
  },
  bannerWrap: {
    width: '100%',
    aspectRatio: 2.5,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: theme.spacing.md,
    marginTop: -theme.spacing['2xl'],
    marginBottom: theme.spacing.xs,
  },
  infoPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: theme.radii.lg,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    marginLeft: -theme.spacing.lg,
    paddingLeft: theme.spacing.xl,
    ...theme.shadows.md,
  },
  partyAvatar: {
    width: 48,
    height: 48,
    borderRadius: theme.radii.full,
    borderWidth: 2,
    borderColor: theme.colors.surface,
    backgroundColor: theme.colors.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  partyName: {
    flex: 1,
    fontSize: theme.fontSizes.base,
    fontWeight: theme.fontWeights.semibold,
    color: theme.colors.textPrimary,
  },
}));
