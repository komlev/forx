const { resolve } = require('path'),
  rootDirectory = resolve(__dirname, '../')

module.exports = {
  entry: './index.js',
  output: {
    path: resolve(rootDirectory, 'lib'),
    filename: 'forx.js',
    sourceMapFilename: 'forx.map',
    library: 'forx',
    libraryTarget: 'umd'
  },
  context: resolve(rootDirectory, 'src'),
  devtool: 'cheap-eval-source-map',
  resolve: {
    extensions: ['.js', '.json'],
    modules: [
      resolve(rootDirectory, 'node_modules'),
      resolve(rootDirectory, 'src')
    ]
  },
  module: {
    exprContextCritical: false,
    loaders: [
      {
        test: /\.js?$/,
        exclude: /node_modules/,
        loaders: ['babel-loader']
      }
    ]
  },
  plugins: []
}
