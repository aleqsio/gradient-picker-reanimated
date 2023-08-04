import { BlurView } from "expo-blur";
import { ViewStyle } from "react-native";
import Animated, {
  Easing,
  Extrapolation,
  SharedValue,
  interpolate,
  interpolateColor,
  useAnimatedStyle,
} from "react-native-reanimated";
import { GRADIENT_BOX_HEIGHT } from "./GradientPicker";

export function GradientBox({
  children,
  pickerOpen,
  currentOffset,
  index,
}: {
  children: React.ReactNode;
  pickerOpen: SharedValue<number>;
  currentOffset: SharedValue<number>;
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
        pickerOpen.value,
        [0, 1, 1.7, 2],
        ["#ffffff00", highlight, highlight, "#fffff00"]
      ),
      zIndex: pickerOpen.value < 1 ? -Math.round(distance * 10) : 0,
      transform: [
        {
          translateY: interpolate(
            pickerOpen.value,
            [0, 1],
            [0, currentOffset.value - index * GRADIENT_BOX_HEIGHT],
            Extrapolation.CLAMP
          ),
        },
        {
          scale: interpolate(
            pickerOpen.value,
            [0, 1],
            [1, 1.3 / Math.log10(distance / 2 + 25)],
            Extrapolation.EXTEND
          ),
        },
      ],
      opacity: isSelected
        ? 1
        : interpolate(
            pickerOpen.value,
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
          width: "100%",
          position: "absolute",
        },
        animatedStyle,
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
