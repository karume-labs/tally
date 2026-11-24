const { getDefaultConfig } = require("expo/metro-config");
const { withUniwindConfig } = require("uniwind/metro");

const config = getDefaultConfig(__dirname);

// expo-sqlite's web worker imports ./wa-sqlite/wa-sqlite.wasm, but Expo's
// default assetExts omits wasm, so Metro fails to resolve it on web builds.
config.resolver.assetExts.push("wasm");

// Without this wrapper every `className` in the app is inert: uniwind needs to
// compile the CSS entry into the style registry Metro serves.
module.exports = withUniwindConfig(config, {
  cssEntryFile: "./src/global.css",
  dtsFile: "./uniwind-types.d.ts",
});
