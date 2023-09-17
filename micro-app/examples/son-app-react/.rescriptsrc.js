const MiniCssExtractPlugin = require('mini-css-extract-plugin');
module.exports = {
  webpack: config => {
    config.output.libraryTarget = 'umd';
    config.output.library = 'react-app';
    config.output.publicPath = '//localhost:8002/';

    return config;
  },
  devServer: (config) => {
    config.headers = {
      'Access-Control-Allow-Origin': '*',
    }
    config.historyApiFallback = true;

    config.hot = false;
    config.watchContentBase = false;
    config.liveReload = false;
    return config;
  },
  // 其他配置...
};