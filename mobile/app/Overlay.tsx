import React from "react";
import { View, Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");
const scanBoxSize = 250;

export const Overlay = () => {
  return (
    <View className="absolute top-0 left-0 w-full h-full">
      {/* Top Dark Layer */}
      <View style={{ height: (height - scanBoxSize) / 2 }} className="bg-black/60 w-full" />

      {/* Middle Row */}
      <View className="flex-row rounded-xl">
        <View style={{ width: (width - scanBoxSize) / 2 }} className="bg-black/60 h-[250px]" />

        {/* Scan Area (clear middle) */}
        <View
          style={{ width: scanBoxSize, height: scanBoxSize }}
          className=""
        />

        <View style={{ width: (width - scanBoxSize) / 2 }} className="bg-black/60 h-[250px]" />
      </View>

      {/* Bottom Dark Layer */}
      <View style={{ height: (height - scanBoxSize) / 2 }} className="bg-black/60 w-full" />
    </View>
  );
};
