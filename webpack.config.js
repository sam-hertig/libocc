module.exports = {
  entry: [
    './src/detail.js'
  ],
  module: {
    rules: [
      {
        test: /\.(js)$/,
        exclude: /node_modules/,
        use: ['babel-loader']
      }
    ]
  },
  resolve: {
    extensions: ['*', '.js', '.jsx']
  },  
  output: {
    path: __dirname + '/dist',
    publicPath: '/',
    filename: 'detail.js'
  },
  devServer: {
    contentBase: './dist'
  }
};