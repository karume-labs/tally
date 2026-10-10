const { getDefaultConfig } = require('expo/metro-config');
const { withUniwindConfig } = require('uniwind/metro');

const config = getDefaultConfig(__dirname);

module.exports = withUniwindConfig(config, {
  cssEntryFile: './global.css',
  dtsFile: './uniwind-types.d.ts',
});

// Ensure src/ is part of the project root for absolute @/ imports
config.watchFolders = config.watchFolders || [];
if (!config.watchFolders.includes(__dirname + '/src')) {
  config.watchFolders.push(__dirname + '/src');
}

