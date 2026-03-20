const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add 'json' to the list of asset extensions
config.resolver.assetExts.push('json');

module.exports = config;