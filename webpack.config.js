var webpack = require('webpack');
var path = require('path');
// 抽離css個別檔案
var ExtractTextPlugin = require('extract-text-webpack-plugin');
// 自動產生 html 檔，並包含 bundle 後的檔案路徑
var HtmlWebpackPlugin = require('html-webpack-plugin');
// 能夠將原來的檔案，跟 bundle 後的檔案，是能跟對照的 mapping 檔
var ManifestPlugin = require('webpack-manifest-plugin');
// 清除dist資料夾
var CleanWebpackPlugin = require('clean-webpack-plugin');

// 告知要把css抽離的檔案(這個替換寫在plugin內) var extractPlugin = new ExtractTextPlugin({
// filename: 'main.css' }); 告知要把js抽離的檔案 這是不會異動到js，所以把他綁在一起
const VENDER_LIBS = ["jquery", "bootstrap"]

module.exports = {
  // entry: './src/js/app.js',
  entry: {
    // 前面app這個key會是後面[name]的替換
    app: './src/js/app.js',
    // 不會異動到的檔案放在vender.js
    vendor: VENDER_LIBS
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    // filename: 'bundle.js',
    filename: './js/[name].[chunkhash].js'
    // vendor: VENDER_LIBS publicPath: '/dist'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: ['es2015']
            }
          }
        ]
      }, {
        // css 壓縮是透過指令 webpack -p 的-p
        test: /\.css$/,
        // use: ['style-loader', 'css-loader'] 改另外產生css檔案作法
        use: ExtractTextPlugin.extract({
          use: ['css-loader', 'postcss-loader']
        })
      },
      // 處理scss
      {
        // css 壓縮是透過指令 webpack -p 的-p
        test: /\.scss$/,
        use: ExtractTextPlugin.extract({
          use: ['css-loader', 'postcss-loader', 'sass-loader']
        })
      }, {
        test: /\.html$/,
        // html 抽離到另外的檔案了
        use: ['html-loader']
      }, {
        // 使用bootstrap 需要額外再加上這些副檔名，否則編譯會報錯
        test: /\.(jpe?g|png|gif)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: 'img/[name]-[hash].[ext]',
              // outputPath: 'img/', 不曉得為什麼加上這個反而會多一個img路徑
              publicPath: '../',
              limit: 10000/* 小於 10kB 的圖片轉成 base64 */
            }

          },
          'image-webpack-loader'
        ]
      }, {
        // 另外將font獨立一個資料夾
        test: /\.(svg|woff|woff2|eot|ttf)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name]-[hash].[ext]',
              outputPath: 'font/',
              publicPath: '../'
            }

          },
          'image-webpack-loader'
        ]
      }, {
        test: /\.json$/,
        use: [
          {
            loader: 'json-loader'
          }
        ]
      }
    ]
  },
  plugins: [
    // extractPlugin, html 模板參考
    new HtmlWebpackPlugin({
      template: 'src/index.html',
      // 加上這一段讓CommonsChunkPlugin不會產稱error
      chunksSortMode: 'dependency'
    }),
    // 要將jquery include近來
    new webpack.ProvidePlugin({jQuery: 'jquery', $: 'jquery', jquery: 'jquery'}),
    new webpack
      .optimize
      .CommonsChunkPlugin({
        // mainfest 是讓瀏覽器不要cach的做法 因為webpack有自己的runtime code
        // 如果單獨寫在vender會每次build檔案的時候，都會改變 所以輸出一個manifest的專門放runtime code
        names: ['vendor', 'manifest']
      }),
    // 壓縮js檔，但測試沒有這個也會自動壓縮
    new webpack
      .optimize
      .UglifyJsPlugin({
        compressor: {
          warnings: false
        }
      }),
    // 打包css用
    new ExtractTextPlugin({filename: "./css/[name].[hash].css", allChunks: true}),
    // 產生對照表是一個json
    new ManifestPlugin({fileName: './manifest/custom-manifest.json'}),
    // 清除dist資料夾，顯示訊息打開
    new CleanWebpackPlugin(['dist'], {
      "verbose": true,
      // 可以增加判斷說不要刪掉哪個檔案 "exclude": ['05ef02be5a02714eab77.vendor.js']
    })
  ]
};