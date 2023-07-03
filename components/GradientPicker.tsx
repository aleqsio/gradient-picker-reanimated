import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import { Text, View, ViewStyle } from "react-native";
import { GradientType, gradients } from "./gradients";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import Animated, {
  Easing,
  Extrapolation,
  SharedValue,
  interpolate,
  interpolateColor,
  runOnJS,
  useAnimatedStyle,
  useFrameCallback,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

function GradientLabel({ gradient }: { gradient: GradientType }) {
  return (
    <View className="flex flex-row items-center">
      <Image
        source={gradient?.image}
        style={{
          width: "100%",
          height: 48,
          borderRadius: 8,
          borderColor: "rgb(15,23,42)",
          borderWidth: 1,
        }}
        transition={{ duration: 500 }}
      />
      <Text className="text-slate-900 ml-3 text-xl absolute">
        {gradient?.name.replace(/([A-Z]+)*([A-Z][a-z])/g, "$1 $2")}
      </Text>
      <Text className="text-slate-900 ml-3 text-xl absolute right-3">
        #
        {String(gradients.length - gradients.indexOf(gradient)).padStart(
          2,
          "0"
        )}
      </Text>
    </View>
  );
}

const GRADIENT_BOX_HEIGHT = 66;

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
    const distance = Math.abs(
      currentOffset.value - index * GRADIENT_BOX_HEIGHT
    );
    const isSelected = distance < GRADIENT_BOX_HEIGHT / 2;
    const highlight = interpolateColor(
      currentOffset.value - index * GRADIENT_BOX_HEIGHT,
      [-GRADIENT_BOX_HEIGHT, 0, GRADIENT_BOX_HEIGHT],
      ["#ffffff00", "#ffffffaa", "#ffffff00"]
    );
    const falloffOpacity = 1 - distance / 500;
    return {
      backgroundColor: interpolateColor(
        activeProgress.value,
        [0, 1, 1.7, 2],
        ["#ffffff00", highlight, highlight, "#fffff00"]
      ),
      width: "100%",
      position: "absolute",
      zIndex: activeProgress.value < 1 ? -Math.round(distance * 10) : 0,
      height: interpolate(
        activeProgress.value,
        [0, 1],
        [
          isSelected ? GRADIENT_BOX_HEIGHT + 40 : GRADIENT_BOX_HEIGHT,
          GRADIENT_BOX_HEIGHT,
        ]
      ),
      transform: [
        {
          translateY: interpolate(
            activeProgress.value,
            [0, 1],
            [0, currentOffset.value - index * GRADIENT_BOX_HEIGHT],
            Extrapolation.CLAMP
          ),
        },
        {
          scale: interpolate(
            activeProgress.value,
            [0, 1],
            [1, 1.3 / Math.log10(distance / 2 + 25)],
            Extrapolation.EXTEND
          ),
        },
      ],
      opacity: isSelected
        ? 1
        : interpolate(
            activeProgress.value,
            [0, 1],
            [0, falloffOpacity],
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
        className="rounded-xl p-2 overflow-hidden border border-[#e5e7eb55] h-full justify-end"
        tint="default"
        intensity={50}
      >
        {children}
      </BlurView>
    </Animated.View>
  );
}

function haptics() {
  Haptics.selectionAsync();
}

export function GradientPicker({
  gradientIdx,
  setGradientIdx,
}: {
  gradientIdx: number;
  setGradientIdx: (idx: number) => void;
}) {
  const activeProgress = useSharedValue(0);
  const currentOffset = useSharedValue(0);
  const initialOffset = useSharedValue(0);
  const gesture = Gesture.Pan()
    .shouldCancelWhenOutside(false)
    .onBegin(() => {
      activeProgress.value = withTiming(1, {
        duration: 400,
        easing: Easing.out(Easing.exp),
      });
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
    })
    .onFinalize(() => {
      activeProgress.value = withTiming(0, {
        duration: 300,
        easing: Easing.out(Easing.cubic),
      });
    });

  useFrameCallback(() => {
    "worklet";
    const computedIndex = Math.round(currentOffset.value / GRADIENT_BOX_HEIGHT);
    if (computedIndex !== gradientIdx) {
      runOnJS(setGradientIdx)(computedIndex);
      runOnJS(haptics)();
    }
  }, true);

  const textStyle = useAnimatedStyle(() => ({
    opacity: 1 - activeProgress.value,
    transform: [
      {
        translateY: interpolate(activeProgress.value, [0, 1], [0, -10]),
      },
      {
        translateX: interpolate(activeProgress.value, [0, 1], [0, 10]),
      },
    ],
  }));

  return (
    <Animated.View className="m-4">
      <View
        style={{
          height: GRADIENT_BOX_HEIGHT,
          position: "relative",
        }}
      >
        <Animated.Text
          style={textStyle}
          className="text-slate-900 ml-3 text-base top-4 absolute z-50"
        >
          Background gradient
        </Animated.Text>
        <GestureDetector gesture={gesture}>
          <View
            style={{
              height: GRADIENT_BOX_HEIGHT + 40,
              width: "100%",
              zIndex: 10000,
            }}
          />
        </GestureDetector>
        {gradients.map((gradient, index) => {
          return (
            <GradientBox
              key={gradient.name}
              currentOffset={currentOffset}
              index={index}
              activeProgress={activeProgress}
            >
              <GradientLabel gradient={gradient} />
            </GradientBox>
          );
        })}
      </View>
    </Animated.View>
  );
}
