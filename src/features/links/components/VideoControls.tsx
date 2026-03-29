import { Feather } from '@expo/vector-icons';
import { VideoPlayer } from 'expo-video';
import { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { Slider } from 'react-native-awesome-slider';

interface VideoControlsProps {
  player: VideoPlayer;
}

export function VideoControls({ player }: VideoControlsProps) {
  const { theme } = useUnistyles();

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const isSeeking = useRef(false);

  const progress = useSharedValue(0);
  const minValue = useSharedValue(0);
  const maxValue = useSharedValue(1);

  useEffect(() => {
    const s1 = player.addListener('playingChange', (e) =>
      setIsPlaying(e.isPlaying),
    );
    const s2 = player.addListener('timeUpdate', (e) => {
      if (!isSeeking.current) {
        progress.value = e.currentTime;
        setCurrentTime(e.currentTime);
      }
    });
    const s3 = player.addListener('statusChange', (e) => {
      if (e.status === 'readyToPlay') {
        const dur = player.duration ?? 0;
        maxValue.value = dur || 1;
        setDuration(dur);
      }
    });

    return () => {
      s1.remove();
      s2.remove();
      s3.remove();
    };
  }, [player, progress, maxValue]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    return `${m}:${Math.floor(s % 60)
      .toString()
      .padStart(2, '0')}`;
  };

  return (
    <View style={styles.row}>
      <Pressable
        onPress={() => (isPlaying ? player.pause() : player.play())}
        hitSlop={12}
        style={styles.playButton}
      >
        <Feather
          name={isPlaying ? 'pause' : 'play'}
          size={theme.iconSizes.lg}
          color={theme.colors.white}
        />
      </Pressable>

      <Slider
        style={styles.slider}
        progress={progress}
        minimumValue={minValue}
        maximumValue={maxValue}
        onSlidingStart={() => {
          isSeeking.current = true;
        }}
        onValueChange={(value) => {
          setCurrentTime(value);
        }}
        onSlidingComplete={(value) => {
          player.currentTime = value;
          isSeeking.current = false;
        }}
        bubble={(value) => formatTime(value)}
        theme={{
          minimumTrackTintColor: theme.colors.white,
          maximumTrackTintColor: 'rgba(255, 255, 255, 0.25)',
          bubbleBackgroundColor: 'rgba(0, 0, 0, 0.7)',
          bubbleTextColor: theme.colors.white,
          heartbeatColor: 'rgba(255, 255, 255, 0.4)',
        }}
        sliderHeight={theme.spacing.xs}
        thumbWidth={theme.iconSizes.sm}
      />

      <Text style={styles.time}>
        {formatTime(currentTime)} / {formatTime(duration)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
  },
  playButton: {
    padding: theme.spacing.sm,
    marginLeft: -theme.spacing.sm,
  },
  slider: {
    flex: 1,
  },
  time: {
    color: theme.colors.white,
    fontSize: theme.fontSizes.sm,
    fontWeight: theme.fontWeights.medium,
    minWidth: 76,
    textAlign: 'right',
  },
}));
