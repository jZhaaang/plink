import { useMemo } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';
import { PartyStackParamList } from '../../../navigation/types';
import MediaGrid from '../components/MediaGrid';

type Props = NativeStackScreenProps<PartyStackParamList, 'AllMedia'>;

export default function AllMediaScreen({ route, navigation }: Props) {
  const { allMedia } = route.params;

  const mediaUrls = useMemo(() => allMedia.map((m) => m.url), [allMedia]);

  const handleMediaPress = (index: number) => {
    navigation.navigate('MediaViewer', { mediaUrls, initialIndex: index });
  };

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-neutral-50">
      {/* Header */}
      <View className="flex-row items-center px-4 py-2">
        <Pressable onPress={() => navigation.goBack()} className="p-2 -ml-2">
          <Feather name="arrow-left" size={24} color="#333" />
        </Pressable>
        <Text
          className="flex-1 text-lg font-semibold text-center"
          numberOfLines={1}
        >
          All Photos
        </Text>
        <View className="w-10" />
      </View>

      {/* Photo count */}
      <View className="px-4 pb-2">
        <Text className="text-sm text-slate-500">
          {allMedia.length} photo{allMedia.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {/* Full scrollable grid */}
      <ScrollView className="flex-1 px-4">
        <MediaGrid
          media={allMedia}
          onMediaPress={handleMediaPress}
          columns={3}
        />
        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
