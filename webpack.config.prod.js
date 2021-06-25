/*
 * @Author: 李聪
 * @Date: 2021-06-24 16:45:12
 * @LastEditors: 李聪
 * @LastEditTime: 2021-06-25 17:51:57
 * @Description: webpack生产环境配置
 */
// 显示webpack构建时间插件,启用此插件会导致报错You forgot to add 'mini-css-extract-plugin' plugin
const SpeedMeasurePlugin = require("speed-measure-webpack-plugin");
const smp = new SpeedMeasurePlugin();
const {
  merge
} = require('webpack-merge'); // 合并公共配置和开发配置方法
const baseWebpackConfig = require('./webpack.config.base'); // 公共配置
const config = require('./public/config/config')['build']; // 根据开发模式引入html配置
const HtmlWebpackPlugin = require('html-webpack-plugin'); // html插件引入
const MiniCssExtractPlugin = require('mini-css-extract-plugin'); // 抽离Css
const webpack = require('webpack');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin; // 查看打包体积
const TerserPlugin = require("terser-webpack-plugin"); // 压缩 JavaScript

const webpackConfig = merge(baseWebpackConfig, {
  mode: 'production',
  devtool: 'hidden-source-map', // inline-|hidden-|eval- 将浏览器打印内容映射到代码对应行
  // webpack5自带热更新，如果package.json内配置了browserslist会导致热更新失效，开发环境下取消此配置即可
  target: "browserslist",

  output: {
    publicPath: './', //通常是CDN地址，本地编译的话先改成./
  },

  performance: {
    hints: 'warning', // 枚举 false关闭
    maxEntrypointSize: 50000000, //入口文件的最大体积，单位字节
    maxAssetSize: 30000000, //生成文件的最大体积，单位字节
    assetFilter: function (assetFilename) { //只给出js文件的性能提示
      return assetFilename.endsWith('.css') || assetFilename.endsWith('.js');
    }
  },

  module: {
    rules: [
      // 样式加载
      {
        test: /\.(le|c)ss$/,
        use: [
          // 抽离CSS
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: '../', // 如果你的output的publicPath配置的是 './' 这种相对路径，那么如果将css文件放在单独目录下，记得在这里指定一下publicPath,否则样式内的路径引用失败
            },
          }, 'css-loader', 'postcss-loader', 'less-loader'
        ],
        exclude: /node_modules/
      },
    ],
  },

  plugins: [
    // html插件，用于打包html文件，通过config可以配置html加载内容
    new HtmlWebpackPlugin({
      template: './public/view/index.html',
      filename: 'index.html', // 打包后的文件名
      chunks: ['index'], // 只加载对应的js
      minify: {
        removeAttributeQuotes: false, // 是否删除属性的双引号
        collapseWhitespace: false, // 是否折叠空白
      },
      config: config.template,
      hash: true // 是否加上hash，默认false
    }),


    // 抽离CSS
    new MiniCssExtractPlugin({
      filename: 'css/[name].css',
    }),

    // 定义环境变量，直接在代码使用 //if(DEV === 'dev') {//开发环境}else {//生产环境}
    new webpack.DefinePlugin({
      DEV: JSON.stringify('prod'), //字符串
      FLAG: 'true' //FLAG 是个布尔类型
    }),

    // 显示打包体积
    new BundleAnalyzerPlugin(),
  ],

  // 优化
  optimization: {
    // 压缩代码
    // minimize: true, // 可省略，默认最优配置：生产环境，压缩 true。开发环境，不压缩 false
    minimizer: [
      new TerserPlugin({
        // parallel: true, // 可省略，默认开启并行
        terserOptions: {
          toplevel: true, // 最高级别，删除无用代码
          ie8: true,
          safari10: true,
        }
      })
    ],

    // 抽离公共代码是对于多页应用来说的
    // 即使是单页应用，同样可以使用这个配置，例如，打包出来的 bundle.js 体积过大，我们可以将一些依赖打包成动态链接库，然后将剩下的第三方依赖拆出来。这样可以有效减小 bundle.js 的体积大小
    splitChunks: { //分割代码块
      maxInitialRequests: 6, //默认是5
      cacheGroups: {
        concatenateModules: false,
        vendor: {
          //第三方依赖
          priority: 1, //设置优先级，首先抽离第三方模块
          name: 'vendor',
          test: /node_modules/,
          chunks: 'initial',
          minSize: 100,
          minChunks: 1 //最少引入了1次
        },
        'lottie-web': {
          name: "lottie-web", // 单独将 react-lottie 拆包
          priority: 5, // 权重需大于`vendor`
          test: /[\/]node_modules[\/]lottie-web[\/]/,
          chunks: 'initial',
          minSize: 100,
          minChunks: 1 //重复引入了几次
        },
        //缓存组
        // common: {
        //   //公共模块
        //   chunks: 'initial',
        //   name: 'common',
        //   minSize: 100, //大小超过100个字节
        //   minChunks: 3 //最少引入了3次
        // }
      }
    },
    // runtimeChunk 的作用是将包含 chunk 映射关系的列表从 main.js 中抽离出来，在配置了 splitChunk 时，记得配置 runtimeChunk
    runtimeChunk: {
      name: 'manifest'
    }
  },


  /**
   * 配置 webpack 去哪些目录下寻找第三方模块，默认情况下，只会去 node_modules 下寻找，
   * 如果你我们项目中某个文件夹下的模块经常被导入，不希望写很长的路径，
   * 那么就可以通过配置 resolve.modules 来简化
   */
  resolve: {
    /**
     * 配置之后，我们 import Dialog from 'dialog'，
     * 会去寻找 ./src/components/dialog，不再需要使用相对路径导入。
     * 如果在 ./src/components 下找不到的话，就会到 node_modules 下寻找。
     */
    modules: ['./src/components', 'node_modules'], //从左到右依次查找

    // 配置项通过别名把原导入路径映射成一个新的导入路径
    /**
     * 示例: @my/react-native-web 配置成react-native，引入时
     * import { View, ListView, StyleSheet, Animated } from 'react-native';
     * 会从 @my/react-native-web 寻找对应的依赖
     */
    alias: {
      'react-native': '@my/react-native-web',
    },

    /**
     * 适配多端的项目中，可能会出现 .web.js, .wx.js，
     * 例如在转web的项目中，我们希望首先找 .web.js，如果没有，再找 .js
     * 首先寻找 ../dialog.web.js ，如果不存在的话，再寻找 ../dialog.js
     * 
     * 引入时就可以省略后缀： import dialog from '../dialog';
     * 在导入语句没带文件后缀时，会自动带上extensions 中配置的后缀后，去尝试访问文件是否存在，
     * 因此要将高频的后缀放在前面，并且数组不要太长，减少尝试次数。
     * 如果没有配置 extensions，默认只会找对对应的js文件
     */
    extensions: ['web.js', '.js'], //当然，你还可以配置 .json, .css
    // 如果配置了 resolve.enforceExtension 为 true，那么导入语句不能缺省文件后缀
    enforceExtension: false,

    /**
     * 有一些第三方模块会提供多份代码，例如 bootstrap，可以查看 bootstrap 的 package.json 文件{"style": "dist/css/bootstrap.css", "sass": "scss/bootstrap.scss","main": "dist/js/bootstrap",}
     * mainFields 默认配置是 ['browser', 'main'],即首先找对应依赖 package.json 中的 brower 字段，如果没有，找 main 字段
     * 如：import 'bootstrap' 默认情况下，找得是对应的依赖的 package.json 的 main 字段指定的文件，即 dist/js/bootstrap
     * 假设我们希望，import 'bootsrap' 默认去找 css 文件的话，可以配置 resolve.mainFields 为
     */
    // mainFields: ['style', 'main']

  },

  // 不打包第三方库
  externals: {
    //jquery通过script引入之后，全局中即有了 jQuery 变量
    'jquery': 'jQuery'
  }

})

// module.exports = smp.wrap(webpackConfig);
module.exports = webpackConfig;