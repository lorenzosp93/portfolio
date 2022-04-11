const { defineConfig } = require('@vue/cli-service')

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