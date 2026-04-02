import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { LinkDetail } from '../../../lib/models';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { Feather } from '@expo/vector-icons';
import { Card, Text } from '../../../components';
import { primaryLocationLabel } from '../../../lib/utils/location';

interface Props {
  link: LinkDetail;
  onPress?: (linkId: string) => void;
}

function formatDate(dateString: string | null): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function LinkCard({ link, onPress }: Props) {
  const { theme } = useUnistyles();

  const locationLabel = primaryLocationLabel(link.locations);
  const isActive = !link.end_time;

  return (
    <Card onPress={() => onPress?.(link.id)} style={styles.card}>
      <View style={styles.bannerWrap}>
        {link.bannerUrl ? (
          <Image
            source={{ uri: link.bannerUrl }}
            cachePolicy="memory-disk"
            contentFit="cover"
            style={{ width: '100%', height: '100%' }}
            transition={180}
          />
        ) : (
          <View
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: theme.colors.accentSurface,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Feather name="camera" size={24} color={theme.colors.gray} />
          </View>
        )}

        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.1)', 'rgba(0,0,0,0.5)']}
          locations={[0, 0.65, 1]}
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 120,
          }}
        />

        {isActive && (
          <View style={styles.badgeWrap}>
            <View style={styles.badge}>
              <Text variant="labelSm" color="inverse">
                Active
              </Text>
            </View>
          </View>
        )}

        <View style={styles.footer}>
          <Text variant="headingMd" color="inverse" numberOfLines={1}>
            {link.name}
          </Text>
          <View style={styles.footerRow}>
            <Text variant="bodySm" color="inverseMuted" numberOfLines={1}>
              {isActive
                ? `Started ${formatDate(link.created_at)}`
                : `${formatDate(link.created_at)} - ${formatDate(link.end_time)}`}
            </Text>
            {locationLabel && (
              <View style={styles.locationRow}>
                <Feather
                  name="map-pin"
                  size={10}
                  color="rgba(255,255,255,0.7)"
                />
                <Text
                  variant="bodySm"
                  color="inverseMuted"
                  style={styles.locationText}
                  numberOfLines={1}
                >
                  {locationLabel}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create((theme) => ({
  card: {
    overflow: 'hidden',
    marginBottom: theme.spacing.md,
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
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radii.full,
    backgroundColor: theme.colors.badgeActive,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: theme.spacing.xs,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  },
  locationText: {
    flexShrink: 1,
  },
}));
