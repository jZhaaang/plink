import { supabase, updateUser } from '@/lib/supabase';
import { Button, Input } from '@/ui/components';
import * as ImagePicker from 'expo-image-picker';
import { useMemo, useRef, useState } from 'react';
import { Animated, Image, ScrollView, Text, useWindowDimensions, View } from 'react-native';

function getDefaultAvatarUrl(name: string): string {
  return `https://ui-avatars.com/api/?name=${name}&background=random&size=128&length=1`;
}

export default function CompleteProfileScreen({ onComplete }: { onComplete: () => void }) {
  const { width: screenWidth } = useWindowDimensions();

  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef<ScrollView>(null);
  const [step, setStep] = useState(0);

  const [name, setName] = useState('');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const defaultAvatarUri = useMemo(() => {
    return getDefaultAvatarUrl(name);
  }, [name]);

  const avatarToDisplay = avatarUri || defaultAvatarUri;

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync();
    if (!result.canceled) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  const scrollToStep = (index: number) => {
    scrollRef.current?.scrollTo({ x: index * screenWidth, animated: true });
    setStep(index);
  };

  const submitProfile = async () => {
    setLoading(true);

    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData.session?.user;

    let finalAvatarUrl = avatarUri;

    if (!user) return;

    const fileName = `user-avatars/${user.id}-${Date.now()}.jpg`;
    const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, {
      uri: avatarToDisplay,
      type: 'image/jpeg',
      name: fileName,
    } as any);

    if (!uploadError) {
      const { data: publicUrl } = supabase.storage.from('avatars').getPublicUrl(fileName);
      if (publicUrl?.publicUrl) finalAvatarUrl = publicUrl?.publicUrl;

      await updateUser(user.id, { name: name.trim(), avatar_url: finalAvatarUrl });
      scrollToStep(2);
    } else {
      console.log('Error uploading avatar:', uploadError.message);
    }
    setLoading(false);
  };

  return (
    <View className="flex-1 pt-6">
      <ScrollView
        horizontal
        pagingEnabled
        scrollEnabled={false}
        ref={scrollRef}
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
          useNativeDriver: false,
        })}
        scrollEventThrottle={16}
      >
        {/* Step 1: Name */}
        <View className="px-1 justify-center" style={{ width: screenWidth }}>
          <Text className="text-2xl font-bold mb-4">What&apos;s your name?</Text>
          <Input
            placeholder="e.g. Alex"
            value={name}
            onChangeText={setName}
            hasError={name.trim() === ''}
          />
          <Button title="Next" onPress={() => scrollToStep(1)} disabled={name.trim() === ''} />
        </View>

        {/* Step 2: Avatar */}
        <View className="px-6 justify-center" style={{ width: screenWidth }}>
          <Text className="text-2xl font-bold mb-4">Choose an avatar</Text>
          <Image
            source={{ uri: avatarToDisplay }}
            className="w-24 h-24 rounded-full self-center mb-4"
          />
          <Button title="Pick Image" onPress={pickImage} />
          {avatarUri && <Button title="Remove Image" onPress={() => setAvatarUri(null)} />}
          <View className="mt-4">
            <Button title="Back" onPress={() => scrollToStep(0)} intent="secondary" />
            <Button
              title={loading ? 'Saving...' : 'Continue'}
              onPress={submitProfile}
              disabled={loading}
            />
          </View>
        </View>

        {/* Done */}
        <View className="px-6 justify-center" style={{ width: screenWidth }}>
          <Text className="text-2xl font-bold mb-2">All set!</Text>
          <Text className="text-gray-500 mb-6">You&apos;re ready to start linking up!</Text>
          <Button title="Get Started" onPress={onComplete} />
        </View>
      </ScrollView>
      {/* Step indicators */}
      <View className="flex-row justify-center items-center mt-4 mb-20">
        {[0, 1, 2].map((i) => (
          <View
            key={i}
            className={`mx-4 w-3 h-3 rounded-full ${step === i ? 'bg-black' : 'bg-gray-300'}`}
          />
        ))}
      </View>
    </View>
  );
}
