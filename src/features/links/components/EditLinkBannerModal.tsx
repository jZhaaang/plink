import { useEffect, useMemo, useRef, useState } from 'react';
import {
  LayoutChangeEvent,
  PanResponder,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Button, Modal } from '../../../components';
import { LinkPostMedia } from '../../../lib/models';

type Props = {
  visible: boolean;
  onClose: () => void;
  images: LinkPostMedia[];
  initialPath: string | null;
  initialCropX: number;
  initialCropY: number;
  saving?: boolean;
  onSave: (path: string, cropX: number, cropY: number) => Promise<void>;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

const BANNER_ASPECT_RATIO = 2.5;

function coverFocusToCenterPercent(focusPercent: number, viewportRatio: number) {
  if (viewportRatio >= 1) return 50;
  const focus = clamp(focusPercent, 0, 100) / 100;
  return (focus * (1 - viewportRatio) + viewportRatio / 2) * 100;
}

function centerPercentToCoverFocus(centerPercent: number, viewportRatio: number) {
  if (viewportRatio >= 1) return 50;
  const center = clamp(centerPercent, 0, 100) / 100;
  return ((center - viewportRatio / 2) / (1 - viewportRatio)) * 100;
}

export default function EditLinkBannerModal({
  visible,
  onClose,
  images,
  initialPath,
  initialCropX,
  initialCropY,
  saving = false,
  onSave,
}: Props) {
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [cropX, setCropX] = useState(50);
  const [cropY, setCropY] = useState(42);
  const [canvasSize, setCanvasSize] = useState({ width: 1, height: 1 });
  const [imageSize, setImageSize] = useState({ width: 1, height: 1 });
  const dragStartRef = useRef({ centerX: 50, centerY: 50 });
  const cropRef = useRef({ x: 50, y: 42 });
  const marginRef = useRef({ x: 0, y: 0 });
  const viewportRatioRef = useRef({ x: 1, y: 1 });

  useEffect(() => {
    if (!visible) return;
    const preferredImage =
      images.find((image) => image.path === initialPath) ?? images[0] ?? null;
    setSelectedPath(preferredImage?.path ?? null);
    setCropX(initialCropX);
    setCropY(initialCropY);
    setImageSize({ width: 1, height: 1 });
  }, [visible, images, initialPath, initialCropX, initialCropY]);

  const selectedImage = useMemo(
    () => images.find((image) => image.path === selectedPath) ?? null,
    [images, selectedPath],
  );

  useEffect(() => {
    cropRef.current = { x: cropX, y: cropY };
  }, [cropX, cropY]);

  const imageAspectRatio = useMemo(
    () => Math.max(imageSize.width / Math.max(imageSize.height, 1), 0.2),
    [imageSize],
  );

  const photoRect = useMemo(() => {
    const canvasW = Math.max(canvasSize.width, 1);
    const canvasH = Math.max(canvasSize.height, 1);
    const canvasAR = canvasW / canvasH;

    if (imageAspectRatio > canvasAR) {
      const width = canvasW;
      const height = width / imageAspectRatio;
      return { left: 0, top: (canvasH - height) / 2, width, height };
    }

    const height = canvasH;
    const width = height * imageAspectRatio;
    return { left: (canvasW - width) / 2, top: 0, width, height };
  }, [canvasSize, imageAspectRatio]);

  const cropRect = useMemo(() => {
    // This frame exactly represents what a cover-fit banner will show.
    const width =
      imageAspectRatio >= BANNER_ASPECT_RATIO
        ? photoRect.height * BANNER_ASPECT_RATIO
        : photoRect.width;
    const height =
      imageAspectRatio >= BANNER_ASPECT_RATIO
        ? photoRect.height
        : photoRect.width / BANNER_ASPECT_RATIO;

    const viewRatioX = width / Math.max(photoRect.width, 1);
    const viewRatioY = height / Math.max(photoRect.height, 1);

    const centerXPercent = coverFocusToCenterPercent(cropX, viewRatioX);
    const centerYPercent = coverFocusToCenterPercent(cropY, viewRatioY);

    const left =
      photoRect.left + (centerXPercent / 100) * photoRect.width - width / 2;
    const top =
      photoRect.top + (centerYPercent / 100) * photoRect.height - height / 2;
    return { left, top, width, height };
  }, [photoRect, cropX, cropY, imageAspectRatio]);

  useEffect(() => {
    const marginX = ((cropRect.width / 2) / photoRect.width) * 100;
    const marginY = ((cropRect.height / 2) / photoRect.height) * 100;
    marginRef.current = { x: marginX, y: marginY };
    viewportRatioRef.current = {
      x: cropRect.width / Math.max(photoRect.width, 1),
      y: cropRect.height / Math.max(photoRect.height, 1),
    };
  }, [photoRect, cropRect.width, cropRect.height]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onStartShouldSetPanResponderCapture: () => true,
        onMoveShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponderCapture: () => true,
        onPanResponderTerminationRequest: () => false,
        onPanResponderGrant: () => {
          dragStartRef.current = {
            centerX: coverFocusToCenterPercent(
              cropRef.current.x,
              viewportRatioRef.current.x,
            ),
            centerY: coverFocusToCenterPercent(
              cropRef.current.y,
              viewportRatioRef.current.y,
            ),
          };
        },
        onPanResponderMove: (_, gestureState) => {
          const dxPercent = (gestureState.dx / Math.max(photoRect.width, 1)) * 100;
          const dyPercent =
            (gestureState.dy / Math.max(photoRect.height, 1)) * 100;
          const marginX = marginRef.current.x;
          const marginY = marginRef.current.y;

          const nextCenterX = clamp(
            dragStartRef.current.centerX + dxPercent,
            marginX,
            100 - marginX,
          );
          const nextCenterY = clamp(
            dragStartRef.current.centerY + dyPercent,
            marginY,
            100 - marginY,
          );

          setCropX(
            clamp(
              centerPercentToCoverFocus(
                nextCenterX,
                viewportRatioRef.current.x,
              ),
              0,
              100,
            ),
          );
          setCropY(
            clamp(
              centerPercentToCoverFocus(
                nextCenterY,
                viewportRatioRef.current.y,
              ),
              0,
              100,
            ),
          );
        },
      }),
    [photoRect],
  );

  const handleCanvasLayout = (event: LayoutChangeEvent) => {
    setCanvasSize({
      width: Math.max(event.nativeEvent.layout.width, 1),
      height: Math.max(event.nativeEvent.layout.height, 1),
    });
  };

  const handleSave = async () => {
    if (!selectedPath) return;
    await onSave(selectedPath, cropX, cropY);
  };

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      animationType="slide"
      contentClassName="w-[94%] rounded-3xl p-0 overflow-hidden"
      disableBackdropDismiss={saving}
      scrollEnabled={false}
    >
      <LinearGradient
        colors={['#eff6ff', '#ffffff']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="px-5 pt-5 pb-4 border-b border-slate-100"
      >
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-lg font-semibold text-slate-900">
              Edit Banner
            </Text>
            <Text className="text-sm text-slate-500 mt-0.5">
              Position the crop frame over the photo
            </Text>
          </View>
          <Pressable
            onPress={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 items-center justify-center"
            disabled={saving}
          >
            <Feather name="x" size={18} color="#334155" />
          </Pressable>
        </View>
      </LinearGradient>

      <View className="px-5 pt-4 pb-5">
        {selectedImage ? (
          <>
            <View
              className="rounded-2xl overflow-hidden bg-slate-200 border border-slate-200"
              style={{ width: '100%', aspectRatio: imageAspectRatio, maxHeight: 460 }}
              onLayout={handleCanvasLayout}
              {...panResponder.panHandlers}
            >
              <ExpoImage
                source={{ uri: selectedImage.url }}
                contentFit="contain"
                style={{ width: '100%', height: '100%' }}
                transition={0}
                cachePolicy="memory-disk"
                onLoad={(event) => {
                  const source = event.source;
                  if (!source) return;
                  setImageSize({
                    width: Math.max(source.width ?? 1, 1),
                    height: Math.max(source.height ?? 1, 1),
                  });
                }}
              />

              <View
                className="absolute bg-black/45"
                style={{
                  left: photoRect.left,
                  top: photoRect.top,
                  width: photoRect.width,
                  height: Math.max(cropRect.top - photoRect.top, 0),
                }}
                pointerEvents="none"
              />
              <View
                className="absolute bg-black/45"
                style={{
                  left: photoRect.left,
                  top: cropRect.top,
                  width: Math.max(cropRect.left - photoRect.left, 0),
                  height: cropRect.height,
                }}
                pointerEvents="none"
              />
              <View
                className="absolute bg-black/45"
                style={{
                  left: cropRect.left + cropRect.width,
                  top: cropRect.top,
                  width: Math.max(
                    photoRect.left + photoRect.width - (cropRect.left + cropRect.width),
                    0,
                  ),
                  height: cropRect.height,
                }}
                pointerEvents="none"
              />
              <View
                className="absolute bg-black/45"
                style={{
                  left: photoRect.left,
                  top: cropRect.top + cropRect.height,
                  width: photoRect.width,
                  height: Math.max(
                    photoRect.top + photoRect.height - (cropRect.top + cropRect.height),
                    0,
                  ),
                }}
                pointerEvents="none"
              />

              <View
                className="absolute border-2 border-white rounded-xl"
                style={{
                  left: cropRect.left,
                  top: cropRect.top,
                  width: cropRect.width,
                  height: cropRect.height,
                }}
                pointerEvents="none"
              />
              <View
                className="absolute bottom-2 left-3 right-3 flex-row items-center justify-between"
                pointerEvents="none"
              >
                <Text className="text-[11px] text-white/95">
                  Drag frame to crop
                </Text>
                <Text className="text-[11px] text-white/95">
                  X {Math.round(cropX)}% • Y {Math.round(cropY)}%
                </Text>
              </View>
            </View>

            <View className="mt-3 flex-row items-center justify-end">
              <Pressable
                onPress={() => {
                  setCropX(50);
                  setCropY(42);
                }}
                className="px-3 py-1 rounded-full bg-white border border-slate-300"
              >
                <Text className="text-xs font-medium text-slate-700">Reset</Text>
              </Pressable>
            </View>
          </>
        ) : (
          <View className="rounded-2xl bg-slate-50 border border-slate-200 p-6 items-center">
            <View className="w-12 h-12 rounded-full bg-slate-100 items-center justify-center mb-2">
              <Feather name="image" size={20} color="#64748b" />
            </View>
            <Text className="text-sm text-slate-600 text-center">
              Upload an image to this link before setting a banner.
            </Text>
          </View>
        )}

        {images.length > 0 ? (
          <View className="mt-4">
            <Text className="text-xs uppercase tracking-wide text-slate-400 mb-2">
              Link Photos
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8, paddingRight: 4 }}
            >
              {images.map((image) => {
                const isSelected = image.path === selectedPath;
                return (
                  <Pressable
                    key={image.id}
                    onPress={() => setSelectedPath(image.path)}
                    className={`rounded-xl overflow-hidden border-2 ${isSelected ? 'border-blue-500' : 'border-transparent'}`}
                    style={{ width: 76, height: 76 }}
                  >
                    <ExpoImage
                      source={{ uri: image.url }}
                      contentFit="cover"
                      style={{ width: '100%', height: '100%' }}
                    />
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        ) : null}

        <View className="mt-5 flex-row gap-3">
          <Button
            title="Cancel"
            variant="outline"
            onPress={onClose}
            className="flex-1"
            disabled={saving}
          />
          <Button
            title="Save Banner"
            onPress={handleSave}
            className="flex-1"
            loading={saving}
            disabled={!selectedImage || saving}
          />
        </View>
      </View>
    </Modal>
  );
}
