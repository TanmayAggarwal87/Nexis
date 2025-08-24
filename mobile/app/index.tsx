import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Pressable, Alert, ActivityIndicator } from "react-native";
import { ArrowRight, Camera, X } from "lucide-react-native";
import QRCode from "react-native-qrcode-svg";
import { useSessionStore } from "../store/useShareStore";
import { useCameraPermissions } from 'expo-camera';
import { Link, useRouter } from "expo-router";

export default function Index() {
  const { 
    connectUser, 
    sessionId, 
    joinSession, 
    userConnected, 
    status, 
    peerConnected,
    setSessionId
  } = useSessionStore();
  const [permission, requestPermission] = useCameraPermissions();
  const router = useRouter();
  const isPermissionGranted = Boolean(permission?.granted);
  const [id, setId] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [isJoiningSession, setIsJoiningSession] = useState(false);

  useEffect(() => {
    connectUser();
  }, [connectUser]);

  // Redirect to session page when joining a session and connected
  // Redirect to session page when joining a session and connected
useEffect(() => {
  if (isJoiningSession && userConnected && sessionId) {
    console.log("Redirecting to session:", sessionId);
    router.replace(`/${sessionId}`);
    setIsJoiningSession(false);
  }
}, [isJoiningSession, userConnected, sessionId, router]);

// Also add this useEffect to handle the case where we're already connected
useEffect(() => {
  if (sessionId && userConnected && status === "connected") {
    console.log("Already connected, redirecting to session:", sessionId);
    router.replace(`/${sessionId}`);
  }
}, [sessionId, userConnected, status, router]);

  const handleSession = async (joinSessionId: string) => {
    if (!joinSessionId.trim()) {
      Alert.alert("Error", "Please enter a valid connection code");
      return;
    }

    setIsJoining(true);
    setIsJoiningSession(true);
    try {
      await joinSession(joinSessionId);
      // The useEffect above will handle the redirect once connected
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to join session. Please check the code and try again.");
      setIsJoiningSession(false);
    } finally {
      setIsJoining(false);
    }
  };

  const handleCameraPermission = async () => {
    if (!isPermissionGranted) {
      const { granted } = await requestPermission();
      if (!granted) {
        Alert.alert("Permission Required", "Camera permission is needed to scan QR codes");
      }
    }
  };

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
          <QRCode value={sessionId || "default"} size={165} />
        </View>

        {/* Connection Code */}
        <View className="w-72 items-center">
          <Text className="text-gray-500 text-base mt-3">Your Connection code</Text>
          <View className="w-full items-center justify-center py-3 mt-2 rounded-lg border-2 border-gray-500">
            <Text className="font-semibold tracking-widest text-xl">
              {sessionId || "Generating..."}
            </Text>
          </View>
          {isJoiningSession && (
            <Text className="text-sm text-blue-500 mt-1">
              Joining session... {userConnected ? "Connected" : "Connecting"}
            </Text>
          )}
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
              value={id}
              onChangeText={setId}
              placeholder="Enter connection code"
              placeholderTextColor="#9CA3AF"
              className="flex-1 h-14 px-4 rounded-lg border border-gray-300 text-gray-700 shadow-sm text-sm tracking-wide"
            />
            <TouchableOpacity 
              onPress={() => handleSession(id)} 
              disabled={isJoining}
              className="ml-3 h-14 w-14 items-center justify-center rounded-lg bg-indigo-500 shadow-md disabled:bg-gray-400"
            >
              {isJoining ? (
                <ActivityIndicator color="white" />
              ) : (
                <ArrowRight size={20} color="white" />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* QR Scanner Button */}
        <Pressable 
          onPress={handleCameraPermission}
          className={`mt-4 p-4 rounded-lg ${isPermissionGranted ? 'bg-indigo-500' : 'bg-gray-400'}`}
          disabled={!isPermissionGranted}
        >
          <Link href="/scanner" asChild>
            <Pressable className="flex-row items-center">
              <Camera size={24} color="white" />
              <Text className="text-white ml-2 font-semibold">Scan QR Code</Text>
            </Pressable>
          </Link>
        </Pressable>
      </View>
    </View>
  );
}