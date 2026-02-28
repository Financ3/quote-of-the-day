const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Allow .wasm files to be loaded as assets on web
config.resolver.assetExts.push('wasm');

module.exports = config;
