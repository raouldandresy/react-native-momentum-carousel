const path = require('path');
const pak = require('../package.json');

module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    // We use this plugin to resolve the path to the source code of the library
    // This is necessary because we are using a monorepo setup, and we don't
    // want to directly install the library from npm.
    [
      'module-resolver',
      {
        extensions: ['.tsx', '.ts', '.js', '.json'],
        alias: {
          [pak.name]: path.join(__dirname, '..', pak.source),
        },
      },
    ],
    ['react-native-reanimated/plugin'],
  ],
};
