/* eslint-disable import/no-extraneous-dependencies */
const config = require('./webpack.config'),
  webpack = require('webpack'),
  BundleAnalyzer = require('webpack-bundle-analyzer').BundleAnalyzerPlugin,
  LodashModuleReplacementPlugin = require('lodash-webpack-plugin')

config.devtool = 'source-map'
config.plugins = config.plugins.concat([
  new webpack.DefinePlugin({
    'process.env.NODE_ENV': JSON.stringify('production')
  }),
  new LodashModuleReplacementPlugin({
    currying: true,
    flattening: true,
    paths: true
  }),
  new webpack.LoaderOptionsPlugin({
    minimize: true,
    debug: false
  }),
  new webpack.optimize.UglifyJsPlugin({
    beautify: false,
    comments: false,
    sourceMap: 'source-map',
    mangle: {
      screw_ie8: true,
      keep_fnames: true
    },
    compress: {
      warnings: false,
      screw_ie8: true,
      conditionals: true,
      unused: true,
      comparisons: true,
      sequences: true,
      dead_code: true,
      evaluate: true,
      if_return: true,
      join_vars: true
    }
  }),
  new BundleAnalyzer({
    analyzerMode: 'static',
    openAnalyzer: false
  })
])

module.exports = config