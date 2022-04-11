const { defineConfig } = require('@vue/cli-service')
const zlib = require("zlib");


module.exports = defineConfig({
  pages: {
    index: {
      // entry for the page
      entry: 'src/main.js',
      title: "Lorenzo Spinelli's portfolio",
    },
  },
  configureWebpack: {
    devtool: 'source-map'
  },
  transpileDependencies: true,
})