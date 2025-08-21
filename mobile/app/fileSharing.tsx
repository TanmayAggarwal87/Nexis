import React, { useState } from "react";
import { View, Text, TouchableOpacity, FlatList, ScrollView } from "react-native";
import { CloudUpload, Download, File, LogOut, Users, X } from "lucide-react-native";
import "./global.css";

function FileSharing() {
  const [files, setFiles] = useState([
    { name: "example.pdf", size: 24576 },
    { name: "image.png", size: 10240 },
    { name: "image.png", size: 10240 },{ name: "image.png", size: 10240 },{ name: "image.png", size: 10240 }
  ]);

  return (
    <ScrollView className="flex-1 bg-gray-100 p-4 mt-2">
      {/* Header */}
      <View className="flex flex-row justify-between items-center bg-white border border-gray-400 px-3 py-2 rounded-xl mt-3">
        {/* Left */}
        <View className="flex flex-col gap-2">
          <View className="flex flex-row items-center">
            <Text className="text-xl font-bold text-gray-900 tracking-wide">NE</Text>
            <X className="w-5 h-7 bg-indigo-500" strokeWidth={5} />
            <Text className="text-xl font-bold text-gray-900 tracking-wide">IS</Text>
          </View>

          <View className="flex flex-row gap-2 items-center">
            <Text className="text-xs text-green-600">● Connected</Text>
            <Text className="text-xs text-gray-400">• NEXIS-7429</Text>
          </View>
        </View>

        {/* Right */}
        <View className="flex flex-col gap-3 items-center">
          <View className="flex flex-row items-center gap-1">
            <Users size={18} className="text-gray-500" />
            <Text className="text-sm text-gray-500">2 connected</Text>
          </View>

          <TouchableOpacity className="flex flex-row items-center gap-1 px-2 py-1 border border-gray-400 rounded-lg">
            <LogOut size={18} className="text-gray-500" />
            <Text className="text-sm text-gray-500">Disconnect</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Sharing Section */}
      <View className="mt-10">
        {/* Upload Section */}
        <TouchableOpacity className="flex flex-col items-center justify-center h-[300px] w-full p-8 bg-white border-2 border-dashed border-gray-400 rounded-2xl">
          <CloudUpload className="w-12 h-12 text-gray-600 mb-3" />
          <Text className="text-gray-700 font-medium">Tap to select files</Text>
        </TouchableOpacity>

        {/* Uploaded Files */}
        <View className="mt-4">
          {files.map((item, index) => (
            <View
              key={index}
              className="flex flex-row items-center gap-2 mb-2 py-2 px-4 rounded-xl border border-indigo-500 bg-indigo-200/20"
            >
              <File className="text-black" />
              <Text className="text-black font-medium tracking-wider">
                {item.name} ({Math.round(item.size / 1024)} KB)
              </Text>
            </View>
          ))}
        </View>

        {/* Files Received Section */}
        <TouchableOpacity className="flex flex-col items-center justify-center mb-14 mt-3 h-[300px] w-full p-8 bg-white border-2 border-dashed border-gray-400 rounded-2xl">
          <Download className="w-12 h-12 text-gray-600 mb-3" />
          <Text className="text-gray-700 font-medium">View Files Received</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

export default FileSharing;
