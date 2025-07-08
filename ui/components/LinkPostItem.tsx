import { Ionicons } from '@expo/vector-icons';
import { formatDistanceToNow } from 'date-fns';
import { Image, Text, TouchableOpacity, View } from 'react-native';

type Props = {
  name: string;
  avatarUrl: string;
  createdAt: string;
  comment: string | null;
  imageUrls: string[];
  canDelete?: boolean;
  onDelete?: () => void;
};

export default function LinkPostItem({
  name,
  avatarUrl,
  createdAt,
  comment,
  imageUrls,
  canDelete,
  onDelete,
}: Props) {
  const photoCount = imageUrls.length;
  const hasComment = !!comment?.trim();

  const actionText =
    photoCount > 0
      ? `${name} added ${photoCount} photo${photoCount > 1 ? 's' : ''}`
      : `${name} commented`;

  return (
    <View className="px-4 py-3 border border-gray-200 rounded-lg mb-3 bg-white">
      {/* Header */}
      <View className="flex-row items-center mb-2">
        <Image source={{ uri: avatarUrl }} className="w-8 h-8 rounded-full mr-2" />
        <Text className="font-semibold text-base">{actionText}</Text>
        {canDelete && onDelete && (
          <TouchableOpacity onPress={onDelete} className="ml-2">
            <Ionicons name="trash" size={16} color="#ef4444" />
          </TouchableOpacity>
        )}
      </View>

      {/* Comment */}
      {hasComment && <Text className="text-sm text-gray-800 mb-2">{comment}</Text>}

      {/* Image preview */}
      {photoCount > 0 && (
        <View className="flex-row gap-2 mb-2">
          {imageUrls.map((url, i) => (
            <Image
              key={i}
              source={{ uri: url }}
              className="h-20 w-20 rounded-md"
              resizeMode="cover"
            />
          ))}
        </View>
      )}

      {/* Timestamp */}
      <View className="flex-row justify-between items-center mt-2">
        <Text className="text-gray-400 text-xs">
          {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
        </Text>
      </View>
    </View>
  );
}
