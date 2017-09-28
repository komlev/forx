const config = require('./webpack.config'),
  webpack = require('webpack'),
  BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin

config.plugins = config.plugins.concat([
  new BundleAnalyzerPlugin({
    analyzerMode: 'static',
    openAnalyzer: false
  })
])

module.exports = config
