const htmlWebpackPlugin = require('html-webpack-plugin')
const path = require('path')
module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: 'fd.js',
  },
  plugins: [new htmlWebpackPlugin({
    template: './index.html',
    filename: './index.html',
    inject: true
  })],
  devtool: 'source-map',
  module: {
    rules:[
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  },
  devServer: {
    host: 'localhost',
    port: "8888",
    open: true,
    hot: true
  }
};
