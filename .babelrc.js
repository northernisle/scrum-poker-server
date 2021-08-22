const path = require('path');
const config = require('./jsconfig.json');

module.exports = {
  presets: ['@babel/preset-env'],
  plugins: [
    '@babel/plugin-transform-runtime',
    [
      'module-resolver',
      {
        root: [path.resolve(config.compilerOptions.baseUrl)],
      },
    ],
  ],
};
