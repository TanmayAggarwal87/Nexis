// components/FilePicker.tsx
import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { X, File, Upload } from 'lucide-react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';

interface FilePickerProps {
  onFilesSelected: (files: any[]) => void;
  selectedFiles: any[];
  onRemoveFile: (index: number) => void;
}

export default function FilePicker({ onFilesSelected, selectedFiles, onRemoveFile }: FilePickerProps) {
  const pickFiles = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        multiple: true,
      });

      if (!result.canceled) {
        const files = result.assets.map(asset => ({
          name: asset.name,
          uri: asset.uri,
          size: asset.size || 0,
          type: asset.mimeType || 'application/octet-stream',
        }));
        onFilesSelected([...selectedFiles, ...files]);
      }
    } catch (error) {
      console.log('Error picking files:', error);
    }
  };


  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <View className="mb-4">
      <TouchableOpacity
        onPress={pickFiles}
        className="flex-row items-center justify-center p-4 bg-indigo-500 rounded-lg mb-4"
      >
        <Upload size={20} color="white" />
        <Text className="text-white ml-2 font-semibold">Select Files</Text>
      </TouchableOpacity>

      {selectedFiles.length > 0 && (
        <ScrollView className="max-h-40">
          {selectedFiles.map((file, index) => (
            <View
              key={index}
              className="flex-row items-center justify-between p-3 mb-2 bg-white rounded-lg border border-gray-200"
            >
              <View className="flex-row items-center flex-1">
                <File size={16} color="#4B5563" />
                <View className="ml-2 flex-1">
                  <Text className="text-sm font-medium text-gray-800" numberOfLines={1}>
                    {file.name}
                  </Text>
                  <Text className="text-xs text-gray-500">
                    {formatFileSize(file.size)}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => onRemoveFile(index)}
                className="p-1 ml-2"
              >
                <X size={16} color="#EF4444" />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}