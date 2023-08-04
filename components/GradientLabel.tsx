import { Image } from "expo-image";
import { GradientType, gradients } from "./gradients";
import { Text, View } from "react-native";

export function GradientLabel({ gradient }: { gradient: GradientType }) {
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
