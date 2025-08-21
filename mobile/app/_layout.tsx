import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  return (

    <SafeAreaProvider  > 
       <Stack  screenOptions={{statusBarStyle:"dark", headerShown:false, }} />
    </SafeAreaProvider>

);
}
