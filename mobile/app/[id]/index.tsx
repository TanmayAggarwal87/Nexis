import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
  Linking,
} from "react-native";
import {
  CloudUpload,
  Download,
  File,
  LogOut,
  Users,
  X,
  Send,
} from "lucide-react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSessionStore } from "../../store/useShareStore";
import FilePicker from "../../components/FileSharing";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import * as MediaLibrary from "expo-media-library";

export default function SessionPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendingProgress, setSendingProgress] = useState<
    Record<string, number>
  >({});

  const {
    userConnected,
    files,
    incomingFiles,
    sendFiles,
    closeSession,
    peerConnected,
    sessionId,
    selectedFiles,
    setSelectedFiles,
    clearSelectedFiles,
    removeSelectedFile,
  } = useSessionStore();

  useEffect(() => {
    if (sessionId && id !== sessionId) {
      router.replace("/");
    }
  }, [sessionId, id, router]);

  if (id !== sessionId) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
        <Text className="mt-4">Redirecting...</Text>
      </View>
    );
  }

  const handleDisconnect = async () => {
    setIsLoading(true);
    try {
      await closeSession();
      router.replace("/");
    } catch (error) {
      Alert.alert("Error", "Failed to disconnect properly");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendFiles = async () => {
    if (selectedFiles.length === 0) {
      Alert.alert("No Files", "Please select files to send");
      return;
    }

    if (!userConnected || !peerConnected) {
      Alert.alert(
        "Not Connected",
        "Please wait for the connection to be established"
      );
      return;
    }

    setIsSending(true);
    const initialProgress: Record<string, number> = {};
    selectedFiles.forEach((file) => {
      initialProgress[file.name] = 0;
    });
    setSendingProgress(initialProgress);

    try {
      const filesToSend = selectedFiles.map((file) => ({
        name: file.name,
        size: file.size,
        type: file.type || "application/octet-stream",
        uri: file.uri,
      }));

      await sendFiles(filesToSend);
      clearSelectedFiles();
      Alert.alert("Success", "Files sent successfully");
    } catch (error) {
      console.log("Error sending files:", error);
      Alert.alert("Error", "Failed to send files");
    } finally {
      setIsSending(false);
      setSendingProgress({});
    }
  };

  const handleDownloadFile = async (file: any) => {
    try {
      const timestamp = new Date().getTime();
      const fileExtension = file.name.split(".").pop();
      const baseName = file.name.replace(`.${fileExtension}`, "");
      const fileName = `${baseName}_${timestamp}.${fileExtension}`;

      let fileUri;

      if (Platform.OS === "android") {
        const externalDir = FileSystem.documentDirectory;
        fileUri = externalDir + fileName;

        await FileSystem.copyAsync({
          from: file.uri,
          to: fileUri,
        });

        Alert.alert(
          "File Saved",
          `File "${file.name}" has been saved to your app's storage.\n\n${fileUri}`,
          [
            { text: "OK" },
            {
              text: "Open File",
              onPress: () => {
                Linking.openURL(fileUri).catch(() => {
                  Alert.alert("Error", "No app available to open this file");
                });
              },
            },
          ]
        );
      } else {
        const downloadDir = FileSystem.documentDirectory;
        fileUri = downloadDir + fileName;

        await FileSystem.copyAsync({
          from: file.uri,
          to: fileUri,
        });
        await Sharing.shareAsync(fileUri, {
          mimeType: file.type,
          dialogTitle: `Save ${file.name}`,
          UTI: file.type,
        });
      }
    } catch (error) {
      console.log("Error saving file:", error);
      Alert.alert("Error", "Failed to save file. Please try again.", [
        { text: "OK" },
      ]);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <ScrollView className="flex-1 bg-gray-100 p-4 mt-2">
      {/* Header */}
      <View className="flex-row justify-between items-center bg-white border border-gray-300 px-4 py-3 rounded-xl mt-3">
        {/* Left */}
        <View className="flex-col gap-1">
          <View className="flex-row items-center">
            <Text className="text-xl font-bold text-gray-900 tracking-wide">
              NE
            </Text>
            <X size={20} strokeWidth={5} color="#6366F1" />
            <Text className="text-xl font-bold text-gray-900 tracking-wide">
              IS
            </Text>
          </View>

          <View className="flex-row gap-2 items-center">
            <View
              className={`w-2 h-2 rounded-full ${userConnected ? "bg-green-600" : "bg-red-600"}`}
            />
            <Text
              className={`text-xs ${userConnected ? "text-green-600" : "text-red-600"}`}
            >
              {userConnected ? "Connected" : "Disconnected"}
            </Text>
            <Text className="text-xs text-gray-400">• {sessionId || id}</Text>
          </View>
        </View>

        {/* Right */}
        <View className="flex-col gap-2 items-end">
          <View className="flex-row items-center gap-1">
            <Users size={18} color="#6B7280" />
            <Text className="text-sm text-gray-500">
              {userConnected && peerConnected ? "2 connected" : "1 connected"}
            </Text>
          </View>

          <TouchableOpacity
            onPress={handleDisconnect}
            disabled={isLoading}
            className="flex-row items-center gap-1 px-3 py-2 border border-gray-300 rounded-lg"
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#6B7280" />
            ) : (
              <>
                <LogOut size={16} color="#6B7280" />
                <Text className="text-sm text-gray-500">Disconnect</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* File Sharing Section */}
      <View className="mt-8">
        {/* File Picker */}
        <FilePicker
          onFilesSelected={setSelectedFiles}
          selectedFiles={selectedFiles}
          onRemoveFile={removeSelectedFile}
        />

        {/* Send Files Button */}
        {selectedFiles.length > 0 && (
          <TouchableOpacity
            onPress={handleSendFiles}
            disabled={isSending || !userConnected || !peerConnected}
            className={`flex-row items-center justify-center p-4 rounded-lg mb-6 ${
              isSending || !userConnected || !peerConnected
                ? "bg-gray-400"
                : "bg-indigo-500"
            }`}
          >
            {isSending ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Send size={20} color="white" />
                <Text className="text-white ml-2 font-semibold">
                  Send {selectedFiles.length} File
                  {selectedFiles.length !== 1 ? "s" : ""}
                </Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {/* Sending Progress */}
        {isSending && selectedFiles.length > 0 && (
          <View className="mb-6">
            <Text className="text-lg font-semibold text-gray-800 mb-3">
              Sending Files
            </Text>
            {selectedFiles.map((file, index) => (
              <View
                key={index}
                className="mb-3 p-3 bg-white rounded-lg border border-gray-200"
              >
                <View className="flex-row items-center justify-between mb-2">
                  <Text
                    className="text-sm font-medium text-gray-800"
                    numberOfLines={1}
                  >
                    {file.name}
                  </Text>
                  <Text className="text-xs text-gray-500">
                    {formatFileSize(file.size)}
                  </Text>
                </View>
                <View className="w-full bg-gray-200 rounded-full h-2">
                  <View
                    className="bg-indigo-500 h-2 rounded-full"
                    style={{ width: `${sendingProgress[file.name] || 0}%` }}
                  />
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Incoming Files Progress */}
        {Object.keys(incomingFiles).length > 0 && (
          <View className="mb-6">
            <Text className="text-lg font-semibold text-gray-800 mb-3">
              Receiving Files
            </Text>
            {Object.entries(incomingFiles).map(([fileName, fileInfo]) => (
              <View
                key={fileName}
                className="flex-row items-center gap-3 mb-3 py-3 px-4 rounded-xl border border-blue-500 bg-blue-100/30"
              >
                <Download size={20} color="#3B82F6" />
                <View className="flex-1">
                  <Text className="text-black font-medium tracking-wide">
                    {fileName}
                  </Text>
                  <Text className="text-gray-600 text-sm">
                    {formatFileSize(fileInfo.fileSize)} •{" "}
                    {fileInfo.receivedChunks}/{fileInfo.totalChunks} chunks
                  </Text>
                  <View className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                    <View
                      className="bg-blue-500 h-1.5 rounded-full"
                      style={{
                        width: `${(fileInfo.receivedChunks / fileInfo.totalChunks) * 100}%`,
                      }}
                    />
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Received Files Section */}
        {files.length > 0 && (
          <View className="mb-10">
            <Text className="text-lg font-semibold text-gray-800 mb-3">
              Received Files ({files.length})
            </Text>
            {files.map((file, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => handleDownloadFile(file)}
                className="flex-row items-center gap-3 mb-3 py-3 px-4 rounded-xl border border-green-500 bg-green-100/30"
              >
                <File size={20} color="#10B981" />
                <View className="flex-1">
                  <Text className="text-black font-medium tracking-wide">
                    {file.name}
                  </Text>
                  <Text className="text-gray-600 text-sm">
                    {formatFileSize(file.size)}
                  </Text>
                </View>
                <Download size={16} color="#10B981" />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}
