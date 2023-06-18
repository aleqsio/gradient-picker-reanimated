import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import { Text, TextInput, View, ViewStyle } from "react-native";
import { GradientType, gradients } from "./gradients";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import Animated, {
  Extrapolation,
  SharedValue,
  interpolate,
  interpolateColor,
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useDerivedValue,
  useFrameCallback,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useState } from "react";

function GradientLabel({ gradient }: { gradient: GradientType }) {
  return (
    <View className="flex flex-row items-center">
      <Image
        source={gradient?.image}
        style={{ width: 48, height: 48, borderRadius: 8 }}
      />
      <Text className="text-slate-800 ml-3 text-xl">
        {gradient?.name.replace(/([A-Z]+)*([A-Z][a-z])/g, "$1 $2")}
      </Text>
    </View>
  );
}

const GRADIENT_BOX_HEIGHT = 66;

function compare(a: number, b: number) {
  "worklet";
  return Math.max(-1, Math.min(1, a - b));
}

function GradientBox({
  children,
  activeProgress,
  currentOffset,
  style,
  index,
}: {
  children: React.ReactNode;
  activeProgress: SharedValue<number>;
  currentOffset: SharedValue<number>;
  isSelectedBox?: boolean;
  style?: ViewStyle;
  index?: number;
}) {
  const animatedStyle = useAnimatedStyle(() => {
    const isSelected =
      Math.abs(currentOffset.value - index * GRADIENT_BOX_HEIGHT) <
      GRADIENT_BOX_HEIGHT / 2;
    const highlight = interpolateColor(
      currentOffset.value - index * GRADIENT_BOX_HEIGHT,
      [-GRADIENT_BOX_HEIGHT, 0, GRADIENT_BOX_HEIGHT],
      ["#ffffff00", "#ffffffaa", "#ffffff00"]
    );
    return {
      backgroundColor: interpolateColor(
        activeProgress.value,
        [0, 1, 1.7, 2],
        ["#ffffff00", highlight, highlight, "#fffff00"]
      ),
      width: "100%",
      position: "absolute",
      zIndex: -Math.round(
        Math.abs(currentOffset.value - index * GRADIENT_BOX_HEIGHT)
      ),

      transform: [
        {
          translateY: interpolate(
            activeProgress.value,
            [0, 1],
            [0, -(index || 0) * GRADIENT_BOX_HEIGHT + currentOffset.value],
            Extrapolation.CLAMP
          ),
        },
        {
          scale: interpolate(
            activeProgress.value,
            [0, 1],
            [
              1,
              1.3 /
                Math.log10(
                  Math.abs(currentOffset.value - index * GRADIENT_BOX_HEIGHT) /
                    2 +
                    25
                ),
            ],
            Extrapolation.CLAMP
          ),
        },
      ],
      opacity: isSelected
        ? 1
        : interpolate(
            activeProgress.value,
            [0, 1],
            [0, 1],
            Extrapolation.CLAMP
          ),
    };
  });
  return (
    <Animated.View
      style={[
        {
          borderRadius: 12,
          height: GRADIENT_BOX_HEIGHT,
        },
        animatedStyle,
        style,
      ]}
      pointerEvents={"none"}
    >
      <BlurView
        className="rounded-xl p-2 overflow-hidden border border-[#e5e7eb55] h-full"
        tint="default"
        intensity={50}
      >
        {children}
      </BlurView>
    </Animated.View>
  );
}

export function GradientPicker({
  gradientIdx,
  setGradientIdx,
}: {
  gradientIdx: number;
  setGradientIdx: (idx: number) => void;
}) {
  const activeProgress = useSharedValue(0);
  const currentGradient = useSharedValue(0);
  const currentOffset = useSharedValue(0);
  const roundedOffset = useDerivedValue(() => {
    const value =
      Math.round(currentOffset.value / GRADIENT_BOX_HEIGHT) *
      GRADIENT_BOX_HEIGHT;
    return (
      value +
      Math.sign(currentOffset.value - value) *
        Math.pow(
          Math.abs(currentOffset.value - value) / GRADIENT_BOX_HEIGHT,
          1.5
        ) *
        GRADIENT_BOX_HEIGHT
    );
  }, [currentOffset.value]);
  const initialOffset = useSharedValue(0);
  const gesture = Gesture.Pan()
    .shouldCancelWhenOutside(false)
    .onBegin(() => {
      activeProgress.value = withTiming(1);
      initialOffset.value = currentOffset.value;
    })
    .onChange((e) => {
      currentOffset.value = Math.max(
        0,
        Math.min(
          initialOffset.value + e.translationY,
          GRADIENT_BOX_HEIGHT * (gradients.length - 1)
        )
      );
      // Math.max(
      //   -delayedInteractionSelectedIndex * GRADIENT_BOX_HEIGHT,
      //   Math.min(
      //     e.translationY,
      //     (gradients.length - 1 - delayedInteractionSelectedIndex) *
      //       GRADIENT_BOX_HEIGHT
      //   )
      // );
    })
    .onFinalize(() => {
      activeProgress.value = withTiming(0, { duration: 300 }, () => {});
    });
  const frameCallback = useFrameCallback((frameInfo) => {
    "worklet";
    const computedIndex = Math.round(currentOffset.value / GRADIENT_BOX_HEIGHT);
    if (computedIndex !== gradientIdx) {
      runOnJS(setGradientIdx)(computedIndex);
    }
  }, true);

  return (
    <View
      style={{ height: GRADIENT_BOX_HEIGHT, position: "relative", margin: 16 }}
    >
      <GestureDetector gesture={gesture}>
        <View
          style={{
            height: GRADIENT_BOX_HEIGHT,
            width: "100%",
            zIndex: 10000,
          }}
        />
      </GestureDetector>
      {gradients.map((gradient, index) => {
        return (
          <GradientBox
            key={gradient.name}
            currentOffset={roundedOffset}
            index={index}
            activeProgress={activeProgress}
          >
            <GradientLabel gradient={gradient} />
          </GradientBox>
        );
      })}
    </View>
  );
}
