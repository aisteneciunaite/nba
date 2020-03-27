const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: {
    index: './src/index.js'
  },
  mode: 'development',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist')
  }
};
