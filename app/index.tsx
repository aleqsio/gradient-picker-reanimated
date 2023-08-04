import {
  Button,
  Dimensions,
  SafeAreaView,
  Text,
  View,
  ViewBase,
} from "react-native";
import { Image } from "expo-image";
import { useState } from "react";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { Easing } from "react-native-reanimated";
import { withRepeat } from "react-native-reanimated";
import { withSequence } from "react-native-reanimated";
import { GradientPicker } from "../components/GradientPicker";
import { gradients } from "../components/gradients";

const { width, height } = Dimensions.get("screen");

export function Background({ gradientIdx }: { gradientIdx: number }) {
  const offset = useSharedValue({ x: 0, y: 0 });
  const imageStyles = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: withTiming(offset.value.x, {
            easing: Easing.bezier(0.5, 0.05, 0.25, 1),
            duration: 500,
          }),
        },
        {
          translateY: withTiming(offset.value.x, {
            easing: Easing.bezier(0.3, 0.01, 0.01, 0.98),
            duration: 500,
          }),
        },
        {
          translateY: withRepeat(
            withSequence(
              withTiming(Math.random() * 70 - 35, { duration: 5000 }),
              withTiming(Math.random() * 70 - 35, { duration: 5000 })
            ),
            1000,
            true
          ),
        },
        {
          translateX: withRepeat(
            withSequence(
              withTiming(Math.random() * 140 - 70, {
                duration: 4000,
                easing: Easing.cubic,
              }),
              withTiming(Math.random() * 140 - 70, {
                duration: 4000,
                easing: Easing.cubic,
              })
            ),
            1000,
            true
          ),
        },
        {
          rotateY:
            Math.round(
              withRepeat(
                withSequence(
                  withTiming((Math.random() - 0.5) * 100, {
                    duration: 4500,
                    easing: Easing.cubic,
                  }),
                  withTiming((Math.random() - 0.5) * 100, {
                    duration: 4500,
                    easing: Easing.cubic,
                  })
                ),
                30,
                true
              )
            ) + "deg",
        },
        { scale: 1.3 },
      ],
    };
  });
  return (
    <Animated.View
      style={[
        {
          width: height,
          height,
          position: "absolute",
          left: (width - height) / 2,
          right: 0,
        },
        imageStyles,
      ]}
    >
      <Image
        style={{ flex: 1 }}
        source={gradients[gradientIdx].image}
        onLoad={() => {
          offset.value = {
            x: Math.random() * 200 - 100,
            y: Math.random() * 100 - 50,
          };
        }}
        transition={{ duration: 500, effect: "cross-dissolve" }}
      />
    </Animated.View>
  );
}

export default function Home() {
  const [gradientIdx, setGradientIdx] = useState(0);

  return (
    <View className="flex-1">
      <Background gradientIdx={gradientIdx} />
      <SafeAreaView className="flex-1 justify-center items-stretch">
        <GradientPicker
          gradientIdx={gradientIdx}
          setGradientIdx={setGradientIdx}
        />
      </SafeAreaView>
    </View>
  );
}
