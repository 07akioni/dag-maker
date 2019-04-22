const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin')

module.exports = {
  publicPath: process.env.NODE_ENV === 'production'
    ? 'https://github-dag-maker.oss-cn-beijing.aliyuncs.com/'
    : '/',
  chainWebpack: config => {
    config
      .plugin('monaco-editor')
      .after('html')
      .use(MonacoWebpackPlugin, [{
        languages: ['javascript'],
        features: ['find']
      }])
  }
}
