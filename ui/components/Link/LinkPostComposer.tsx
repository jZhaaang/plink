import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

type Props = {
  onSubmit: (comment: string, images: string[]) => void;
};

export function LinkPostComposer({ onSubmit }: Props) {
  const [comment, setComment] = useState('');
  const [imageUris, setImageUris] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsMultipleSelection: true,
      mediaTypes: ['images'],
    });

    if (!result.canceled) {
      const newUris = result.assets.map((asset) => asset.uri);
      setImageUris([...imageUris, ...newUris]);
      console.log('Image uris:', newUris);
    }
  };

  const removeImage = (index: number) => {
    const updated = [...imageUris];
    updated.splice(index, 1);
    setImageUris(updated);
  };

  const handleSubmit = async () => {
    if (!comment.trim() && imageUris.length === 0) return;

    setLoading(true);
    await onSubmit(comment.trim(), imageUris);
    setComment('');
    setImageUris([]);
    setLoading(false);
  };

  const isDisabled = loading || (!comment.trim() && imageUris.length === 0);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={80}
    >
      <View className="px-4 pt-2 border-t border-gray-200 bg-white">
        {/* Image previews */}
        {imageUris.length > 0 && (
          <View className="flex-row flex-wrap mb-2 gap-2">
            {imageUris.map((uri, i) => (
              <View key={i} className="relative">
                <Image source={{ uri }} className="w-20 h-20 rounded-md" />
                <TouchableOpacity
                  onPress={() => removeImage(i)}
                  className="absolute top-0 right-0 bg-black bg-opacity-50 rounded-full p-0.5"
                >
                  <Ionicons name="close" size={16} color="white" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Input bar */}
        <View className="flex-row items-center gap-2 bg-gray=100 rounded-full px-3 py-2">
          <TouchableOpacity onPress={pickImage}>
            <Ionicons name="image" size={20} color="#4b5563" />
          </TouchableOpacity>

          <TextInput
            value={comment}
            onChangeText={setComment}
            placeholder="Add a comment"
            className="flex-1 text-sm text-black px-2"
            multiline
          />

          <TouchableOpacity onPress={handleSubmit} disabled={isDisabled}>
            <Ionicons
              name="send"
              size={20}
              color={isDisabled ? '#a1a1aa' : '#2563eb'}
              style={{ opacity: isDisabled ? 0.4 : 1 }}
            />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
