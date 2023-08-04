import { View } from "react-native";
import { gradients } from "./gradients";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import {
  Easing,
  runOnJS,
  useFrameCallback,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { GradientLabel } from "./GradientLabel";
import { GradientBox } from "./GradientBox";

export const GRADIENT_BOX_HEIGHT = 66;

export const DURATION_AND_EASING = {
  duration: 400,
  easing: Easing.out(Easing.exp),
};

export function GradientPicker({
  gradientIdx,
  setGradientIdx,
}: {
  gradientIdx: number;
  setGradientIdx: (idx: number) => void;
}) {
  const pickerOpen = useSharedValue(0);
  const currentOffset = useSharedValue(0);
  const initialOffset = useSharedValue(0);
  const gesture = Gesture.Pan()
    .shouldCancelWhenOutside(false)
    .onBegin(() => {
      pickerOpen.value = withTiming(1);
      initialOffset.value = gradientIdx * GRADIENT_BOX_HEIGHT;
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
      pickerOpen.value = withTiming(0, {
        duration: 300,
        easing: Easing.out(Easing.cubic),
      });
    });

  useFrameCallback(() => {
    "worklet";
    const computedIndex = Math.round(currentOffset.value / GRADIENT_BOX_HEIGHT);
    if (computedIndex !== gradientIdx) {
      runOnJS(setGradientIdx)(computedIndex);
      runOnJS(Haptics.selectionAsync)();
    }
  }, true);

  return (
    <View className="m-4">
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
            currentOffset={currentOffset}
            index={index}
            pickerOpen={pickerOpen}
          >
            <GradientLabel gradient={gradient} />
          </GradientBox>
        );
      })}
    </View>
  );
}
