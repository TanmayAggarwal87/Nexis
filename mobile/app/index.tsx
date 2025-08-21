import React from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { ArrowRight, X } from "lucide-react-native";
import QRCode from "react-native-qrcode-svg";
import "./global.css"

export default function Index() {
  return (
    <View className="flex-1 items-center justify-center px-4 bg-white">
      {/* Header */}
      <View className="items-center mt-10 mb-6">
        <View className="flex-row items-center">
          <Text className="text-4xl font-bold text-gray-900 tracking-wide">NE</Text>
          <X size={40} strokeWidth={4} color="#6366F1" /> 
          <Text className="text-4xl font-bold text-gray-900 tracking-wide">IS</Text>
        </View>
      </View>

      {/* Subtext */}
      <Text className="text-lg text-gray-600 text-center max-w-xs mb-6">
        Connect instantly with anyone to share files securely
      </Text>

      {/* QR Section */}
      <View className="items-center gap-3">
        <View className="w-49 h-49 bg-black rounded-xl size-fit items-center justify-center">
          <QRCode value="https://google.com" size={165} />
        </View>

        {/* Connection Code */}
        <View className="w-72 items-center">
          <Text className="text-gray-500 text-base mt-3">Your Connection code</Text>
          <View className="w-full items-center justify-center py-3 mt-2 rounded-lg border-2 border-gray-500">
            <Text className="font-semibold tracking-widest text-xl">NEXIS-7429</Text>
          </View>
        </View>

        {/* Divider */}
        <View className="flex-row items-center w-72 my-4">
          <View className="flex-1 h-px bg-gray-400" />
          <Text className="mx-3 text-gray-500">OR</Text>
          <View className="flex-1 h-px bg-gray-400" />
        </View>

        {/* Input + Button */}
        <View className="w-72">
          <Text className="text-center text-sm font-medium text-gray-500 tracking-widest mb-2">
            CONNECT TO SOMEONE
          </Text>
          <View className="flex-row items-center mt-2">
            <TextInput
              placeholder="Enter connection code or scan QR"
              placeholderTextColor="#9CA3AF"
              className="flex-1 h-14 px-4 rounded-lg border border-gray-300 text-gray-700 shadow-sm text-sm tracking-wide"
            />
            <TouchableOpacity className="ml-3 h-14 w-14 items-center justify-center rounded-lg bg-indigo-500 shadow-md">
              <ArrowRight size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}
