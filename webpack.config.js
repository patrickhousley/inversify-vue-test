const path = require('path');
const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const StatsPlugin = require('stats-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const environment = process.env.NODE_ENV || 'development';

const configuration = {
  devtool: environment === 'development'
    ? 'inline-source-map'
    : 'source-map',
  performance: {
    hints: environment === 'development'
      ? 'warning'
      : false
  },
  resolve: {
    extensions: [ '.ts', '.js', '.json' ],
    modules: [
      'node_modules',
      '.'
    ]
  },
  entry: {
    'app': 'src/main.ts',
    'styles': 'src/styles.scss'
  },
  output: {
    path: path.join(__dirname, 'dist'),
    publicPath: '/',
    filename: '[name].[hash].js',
    chunkFilename: '[id].[hash].js'
  },
  module: {
    rules: [
      {
        test: /\.json$/,
        use: [
          { loader: 'json-loader' }
        ]
      },
      {
        test: /\.ts$/,
        use: [
          { loader: 'ts-loader' }
        ]
      },
      {
        test: /\.html$/,
        exclude: /index\.html$/,
        use: [
          {
            loader: 'vue-template-loader',
            options: {
              scoped: true,
              sourceMap: true
            }
          }
        ]
      },
      {
        test: /\.scss/,
        use: [
          {
            loader: 'sass-loader',
            options: {
              sourceMap: true
            }
          }
        ]
      },
      {
        enforce: 'post',
        test: /\.s?css$/,
        use: [
          {
            loader: 'style-loader',
            options: {
              sourceMap: true
            }
          },
          {
            loader: 'postcss-loader',
            options: {
              sourceMap: true,
              plugins: [
                require('autoprefixer')(),
                require('cssnano')()
              ]
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new StatsPlugin('stats.json', 'verbose'),
    new webpack.ProgressPlugin(),
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.optimize.ModuleConcatenationPlugin(),
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify(environment)
      }
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'src', 'index.html')
    }),
    new CleanWebpackPlugin(['dist'], {
      root: path.resolve(__dirname)
    })
  ],
  target: 'web',
  devServer: {
    port: 3000,
    host: 'localhost',
    historyApiFallback: true,
    contentBase: path.resolve(__dirname, 'src')
  }
};

if (environment === 'development') {
} else if (environment === 'production') {
  configuration.plugins.push(
    new webpack.optimize.UglifyJsPlugin({
      sourceMap: true,
      beautify: false,
      output: {
        comments: false
      },
      mangle: {
        screw_ie8: true,
        except: ['$']
      },
      compress: {
        screw_ie8: true,
        warnings: false,
        collapse_vars: true,
        reduce_vars: true,
        conditionals: true,
        unused: true,
        comparisons: true,
        sequences: true,
        dead_code: true,
        evaluate: true,
        if_return: true,
        join_vars: true,
        drop_console: true,
        drop_debugger: true
      }
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendors',
      chunks: [
        'app'
      ],
      // Move all node_modules into vendors chunk but not @angular
      minChunks: module => /node_modules/.test(module.resource)
    })
  );
}

module.exports = configuration;