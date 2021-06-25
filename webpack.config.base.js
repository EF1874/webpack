/*
 * @Author: 李聪
 * @Date: 2021-06-23 14:28:46
 * @LastEditors: 李聪
 * @LastEditTime: 2021-06-25 16:40:40
 * @Description: webpack公共配置
 */
const HtmlWebpackPlugin = require('html-webpack-plugin'); // html插件引入
const path = require('path'); // 引入路径
// const {
//   CleanWebpackPlugin
// } = require('clean-webpack-plugin'); // 自动清理上次build的文件插件
const CopyWebpackPlugin = require('copy-webpack-plugin'); // 自动拷贝文件
const OptimizeCssPlugin = require('optimize-css-assets-webpack-plugin'); // 压缩CSS
// const Happypack = require('happypack'); // 并发处理，项目复杂的时候使用
// 为模块提供中间缓存，webpack5不需要
// const HardSourceWebpackPlugin = require('hard-source-webpack-plugin');

module.exports = {
  // entry: './src/index.js', //webpack的默认配置
  // 为数组时，表示有“多个主入口”，想要多个依赖文件一起注入时，会这样配置
  entry: {
    // './src/polyfills.js', // 文件中可能只是简单的引入了一些 polyfill，例如 babel-polyfill，whatwg-fetch 等，需要在最前面被引入
    index: './src/index.js',
    login: './src/login.js'
  },

  output: {
    path: path.resolve(__dirname, 'dist'), //必须是绝对路径
    filename: '[name].[fullhash:6].js', // 考虑到CDN缓存的问题，我们一般会给文件名加上 hash，可以指定hash长度[hash:6]
    publicPath: '/', //通常是CDN地址
    clean: true // 清理build文件，webpack5通过此属性
  },

  module: {
    // loader配置
    rules: [
      // babel将代码转换成兼容模式
      {
        test: /\.jsx?$/,
        use: [
          /**
           * thread-loader跟Happypack构建时间基本没什么差别,二选一
           * 将loader添加到新的worker池，配置比Happypack简单
           * 在 worker 池(worker pool)中运行的 loader 是受到限制的
           * 这些 loader 不能产生新的文件
           * 这些 loader 不能使用定制的 loader API（也就是说，通过插件）
           * 这些 loader 无法获取 webpack 的选项设置。
           */
          'thread-loader',
          'cache-loader', // 将结果缓存到磁盘
          {
            loader: 'babel-loader',
            options: {
              presets: ["@babel/preset-env"],
              plugins: [
                [
                  "@babel/plugin-transform-runtime",
                  {
                    "corejs": 3
                  }
                ]
              ]
            }
          }
        ],
        exclude: /node_modules/
      },

      // 图片加载
      {
        test: /\.(png|jpg|gif|jpeg|webp|svg|eot|ttf|woff|woff2)$/,
        // type: 'asset'打包静态资源
        type: 'asset',
        // 指定图片大小，超出才打包
        parser: {
          dataUrlCondition: {
            maxSize: 10 * 1024 // 4kb
          }
        },
        // webpack5使用generator.filename指定图片打包路径
        generator: {
          // filename: path.resolve(__dirname, 'assets/imgs', '[hash:6][ext][query]')
          filename: './assets/imgs/[hash:6][ext][query]'
        },
        // 也可以用url-loader
        // use: [{
        //   loader: 'url-loader',
        //   options: {
        //     limit: 10240, //10K
        //     esModule: false,
        //     filename: 'assets/[name].[fullhash:6].'
        //   }
        // }],
        exclude: /node_modules/
      },

      // 并发加载
      // {
      //   test: /\.js[x]?$/,
      //   use: 'Happypack/loader?id=js',
      //   include: [path.resolve(__dirname, 'src')]
      // },

      // {
      //   test: /\.css$/,
      //   use: 'Happypack/loader?id=css',
      //   include: [
      //     path.resolve(__dirname, 'src'),
      //     path.resolve(__dirname, 'node_modules', 'bootstrap', 'dist')
      //   ]
      // }
    ],

    noParse: /jquery|lodash/
  },

  // 插件配置
  plugins: [
    // 多页面配置
    new HtmlWebpackPlugin({
      template: './public/view/login.html',
      filename: 'login.[fullhash:6].html', //打包后的文件名
      chunks: ['login']
    }),

    // 自动清理打包文件 不需要传参数喔，它可以找到 outputPath，如果不需要指定不删除文件，webpack5直接在output清除
    // new CleanWebpackPlugin({
    //   cleanOnceBeforeBuildPatterns: ['**/*', '!dll', '!dll/**'] //不删除dll目录下的文件
    // })

    // 复制文件到打包文件夹
    new CopyWebpackPlugin({
      patterns: [{
        from: 'public/js/*.js',
        to: path.resolve(__dirname, 'dist/js', '[name].js'),
        // to: 'js/[name].js', // webpack5 上面和这里 只复制文件而不复制目录
      }]
    }),

    // 可以定义全局变量，尽量不用，语法：new webpack.ProvidePlugin({identifier1: 'module1', identifier2: ['module2', 'property2']});
    // new webpack.ProvidePlugin({
    //   React: 'react',
    //   Component: ['react', 'Component'],
    //   Vue: ['vue/dist/vue.esm.js', 'default'],
    //   $: 'jquery',
    //   _map: ['lodash', 'map']
    // })

    // 压缩CSS
    new OptimizeCssPlugin(),

    // 热更新，webpack5无需配置
    // new webpack.HotModuleReplacementPlugin(),

    // 把任务分解给多个子进程去并发的执行
    // new Happypack({
    //   id: 'js', //和rule中的id=js对应
    //   //将之前 rule 中的 loader 在此配置
    //   use: ['babel-loader'] //必须是数组
    // }),
    // new Happypack({
    //   id: 'css', //和rule中的id=css对应
    //   use: ['style-loader', 'css-loader', 'postcss-loader'],
    // })

    // 为模块提供中间缓存 webpack5不需要此插件
    // new HardSourceWebpackPlugin(),
  ],

}