const htmlWebpackPlugin = require('html-webpack-plugin')
// var { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const path = require('path')
module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: 'utmost.js',
    library: 'Microff',
    libraryTarget: 'umd',
    globalObject: 'this',
    umdNamedDefine: true
  },
  plugins: [
    new htmlWebpackPlugin({
    template: './index.html',
    filename: './index.html',
    inject: true
  }),  		
  // new CleanWebpackPlugin(),
  new CopyWebpackPlugin({
    patterns:[
       {
        from: path.resolve(__dirname, './public'), // 静态资源绝对路径
        to: path.resolve(__dirname, './public')  // 打包进入静态文件夹
        }
      ]
    }),
  ],
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
