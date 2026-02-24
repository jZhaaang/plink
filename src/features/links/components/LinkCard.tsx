import { Pressable, View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { Link } from '../../../lib/models';
import { memo, useState } from 'react';
import { StyleSheet } from 'react-native-unistyles';

interface Props {
  link: Link;
  onPress?: (linkId: string) => void;
}

function formatDate(dateString: string | null): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function LinkCard({ link, onPress }: Props) {
  const isActive = !link.end_time;
  const [pressed, setPressed] = useState(false);

  cardStyles.useVariants({ isActive, pressed });

  return (
    <Pressable
      onPress={() => onPress?.(link.id)}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
    >
      <View style={cardStyles.card}>
        <View style={cardStyles.bannerWrap}>
          {link.bannerUrl ? (
            <Image
              source={{ uri: link.bannerUrl }}
              cachePolicy="memory-disk"
              contentFit="cover"
              contentPosition={{
                left: `${link.banner_crop_x}%`,
                top: `${link.banner_crop_y}%`,
              }}
              style={{ width: '100%', height: '100%' }}
              transition={180}
            />
          ) : (
            <LinearGradient
              colors={['#dbeafe', '#60a5fa']}
              start={{ x: 0, y: 1 }}
              end={{ x: 1, y: 0 }}
              style={{ width: '100%', height: '100%' }}
            />
          )}

          <LinearGradient
            colors={['transparent', 'rgba(15,23,42,0.72)']}
            style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 96 }}
          />

          <View style={cardStyles.badgeWrap}>
            <View style={cardStyles.badge}>
              <Text style={cardStyles.badgeText}>
                {isActive ? 'Active' : 'Ended'}
              </Text>
            </View>
          </View>

          <View style={cardStyles.bottomOverlay}>
            <Text style={cardStyles.linkName} numberOfLines={1}>
              {link.name}
            </Text>
            <Text style={cardStyles.dateText} numberOfLines={1}>
              {isActive
                ? `Started ${formatDate(link.created_at)}`
                : `${formatDate(link.created_at)} - ${formatDate(link.end_time)}`}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

export default memo(LinkCard);

const cardStyles = StyleSheet.create((theme) => ({
  card: {
    borderRadius: theme.radii.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    marginBottom: theme.spacing.md,
    variants: {
      pressed: {
        true: { opacity: 0.9 },
        false: {},
      },
    },
  },
  bannerWrap: {
    width: '100%',
    backgroundColor: theme.colors.surfacePressed,
    aspectRatio: 2.5,
  },
  badgeWrap: {
    position: 'absolute',
    top: theme.spacing.md,
    right: theme.spacing.md,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radii.full,
    variants: {
      isActive: {
        true: { backgroundColor: theme.colors.badgeActive },
        false: { backgroundColor: theme.colors.badgeInactive },
      },
    },
  },
  badgeText: {
    fontSize: theme.fontSizes.xs,
    fontWeight: theme.fontWeights.semibold,
    color: theme.colors.textInverse,
  },
  bottomOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  linkName: {
    fontSize: theme.fontSizes.base,
    fontWeight: theme.fontWeights.semibold,
    color: theme.colors.textInverse,
  },
  dateText: {
    fontSize: theme.fontSizes.xs,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
}));
