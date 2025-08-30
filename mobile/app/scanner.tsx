import { View, Text, Platform, StatusBar } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { CameraView } from 'expo-camera'
import { Overlay } from './Overlay'

const scanner = () => {
  return (
    <SafeAreaView style={{ flex: 1 }}>
        {Platform.OS=="android"?<StatusBar hidden/>:null}
      <CameraView
        style={{ flex: 1 }}
        facing="back"
        onBarcodeScanned={({ data }) => {
          console.log("Scanned:", data);
        }}
      />
      <Overlay/>
    </SafeAreaView>
  )
}

export default scanner;
