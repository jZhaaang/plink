import { Pressable, View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { Link } from '../../../lib/models';

type Props = {
  link: Link;
  onPress?: (linkId: string) => void;
};

function formatDate(dateString: string | null): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function LinkCard({ link, onPress }: Props) {
  const isActive = !link.end_time;

  return (
    <Pressable
      onPress={() => onPress?.(link.id)}
      className="mb-3 active:opacity-90"
    >
      <View className="rounded-2xl overflow-hidden border border-slate-200 bg-white">
        <View className="w-full bg-slate-100" style={{ aspectRatio: 2.5 }}>
          {link.bannerUrl ? (
            <Image
              source={{ uri: link.bannerUrl }}
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
            className="absolute bottom-0 left-0 right-0 h-24"
          />

          <View className="absolute top-3 right-3">
            <View
              className={`px-2.5 py-1 rounded-full ${
                isActive ? 'bg-emerald-500/90' : 'bg-slate-900/65'
              }`}
            >
              <Text className="text-xs font-semibold text-white">
                {isActive ? 'Active' : 'Ended'}
              </Text>
            </View>
          </View>

          <View className="absolute bottom-0 left-0 right-0 px-4 pb-3">
            <Text className="text-base font-semibold text-white" numberOfLines={1}>
              {link.name}
            </Text>
            <Text className="text-xs text-white/80 mt-0.5" numberOfLines={1}>
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
