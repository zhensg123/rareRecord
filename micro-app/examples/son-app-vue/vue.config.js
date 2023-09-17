const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  lintOnSave: false,
  devServer: {
    client: {
      overlay: false,
    }
  },
  devServer: {
    port: 8001,
    headers: {
        'Access-Control-Allow-Origin': '*'
    }
  },
  // css: {
  //   extract: true,
  // },
  publicPath: 'http://localhost:8001/',
})
