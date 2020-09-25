const webpack = require('webpack');
const ENTRY_NAME = 'gmap';

module.exports = function (env, argv) {
  const isProd = env === 'production';
  return {
    mode: isProd ? 'production' : 'development',
    entry: {
      [ENTRY_NAME]: __dirname + '/src/index.js'
    },
    output: {
      libraryTarget: 'umd',
      library: ['echarts', ENTRY_NAME],
      umdNamedDefine: true,
      globalObject: 'this',
      path: __dirname + '/dist',
      pathinfo: !isProd,
      filename: 'echarts-extension-' + (isProd ? '[name].min.js' : '[name].js')
    },
    devtool: isProd ? false : 'source-map',
    externals: {
      echarts: 'echarts'
    }
  }
}
