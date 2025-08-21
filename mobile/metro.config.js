const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

// 1️⃣ Get base Expo config
const config = getDefaultConfig(__dirname);

// 2️⃣ Patch in the QR code transformer
config.transformer = {
  ...config.transformer,
  babelTransformerPath: require.resolve(
    "react-native-qrcode-svg/textEncodingTransformation"
  ),
};

// 3️⃣ Wrap everything with NativeWind support
module.exports = withNativeWind(config, {
  input: "./app/global.css", // ✅ your tailwind css file
});
