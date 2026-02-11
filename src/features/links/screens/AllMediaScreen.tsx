import { useMemo } from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { PartyStackParamList } from '../../../navigation/types';
import { useLinkDetail } from '../hooks/useLinkDetail';
import MediaGrid from '../components/MediaGrid';
import { LinkPostMedia } from '../../../lib/models';

type Props = NativeStackScreenProps<PartyStackParamList, 'AllMedia'>;

export default function AllMediaScreen({ route, navigation }: Props) {
  const { linkId } = route.params;
  const { link, loading } = useLinkDetail(linkId);

  const allMedia = useMemo(() => {
    if (!link) return [];
    return link.posts.flatMap((post) => post.media);
  }, [link]);

  const photoCount = useMemo(
    () => allMedia.filter((m) => m.type === 'image').length,
    [allMedia],
  );
  const videoCount = allMedia.length - photoCount;

  const handleMediaPress = (item: LinkPostMedia) => {
    const index = allMedia.findIndex((m) => m.id === item.id);
    navigation.navigate('MediaViewer', {
      mediaItems: allMedia,
      initialIndex: index === -1 ? 0 : index,
    });
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-slate-50">
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-slate-50">
      <View className="px-4 pt-2 pb-3">
        <View className="flex-row items-center mb-3">
          <Pressable
            onPress={() => navigation.goBack()}
            className="w-10 h-10 rounded-full bg-white items-center justify-center border border-slate-200 active:opacity-80"
          >
            <Feather name="arrow-left" size={20} color="#334155" />
          </Pressable>

          <View className="flex-1 px-3">
            <Text
              className="text-xl font-bold text-slate-900"
              numberOfLines={1}
            >
              All Media
            </Text>
            <Text className="text-sm text-slate-500" numberOfLines={1}>
              {link?.name ?? 'Link'} • {allMedia.length} items
            </Text>
          </View>
        </View>

        <LinearGradient
          colors={['#dbeafe', '#eff6ff']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="rounded-2xl px-4 py-3 border border-blue-100"
        >
          <View className="flex-row items-center gap-2">
            <View className="px-2.5 py-1 rounded-full bg-white/80 border border-blue-100">
              <Text className="text-xs font-semibold text-blue-700">
                Photos {photoCount}
              </Text>
            </View>
            <View className="px-2.5 py-1 rounded-full bg-white/80 border border-blue-100">
              <Text className="text-xs font-semibold text-blue-700">
                Videos {videoCount}
              </Text>
            </View>
          </View>
        </LinearGradient>
      </View>

      {allMedia.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <View className="w-full rounded-2xl bg-white border border-slate-200 p-6 items-center">
            <View className="w-12 h-12 rounded-full bg-slate-100 items-center justify-center mb-3">
              <Feather name="image" size={20} color="#64748b" />
            </View>
            <Text className="text-base font-semibold text-slate-800 mb-1">
              No media yet
            </Text>
            <Text className="text-sm text-slate-500 text-center">
              Photos and videos shared in this link will appear here.
            </Text>
          </View>
        </View>
      ) : (
        <View className="flex-1 px-4">
          <MediaGrid
            media={allMedia}
            onMediaPress={handleMediaPress}
            columns={3}
            scrollEnabled
            ListHeaderComponent={() => (
              <View className="pb-2">
                <Text className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Latest uploads
                </Text>
              </View>
            )}
            ListFooterComponent={() => <View className="h-10" />}
          />
        </View>
      )}
    </SafeAreaView>
  );
}
