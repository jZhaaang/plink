const { withNativeWind } = require('nativewind/metro');

const {
  getSentryExpoConfig
} = require("@sentry/react-native/metro");

module.exports = withNativeWind(getSentryExpoConfig(__dirname), {
  input: './global.css',
});