/*
 * @Author: 李聪
 * @Date: 2021-06-23 14:28:46
 * @LastEditors: 李聪
 * @LastEditTime: 2021-06-25 17:01:10
 * @Description: webpac未区分环境配置
 */
const HtmlWebpackPlugin = require('html-webpack-plugin'); // html插件引入
const isDev = process.env.NODE_ENV === 'development'; // 开发模式
const config = require('./public/config/config')[isDev ? 'dev' : 'build']; // 根据开发模式引入html配置
const path = require('path'); // 引入路径
// const {
//   CleanWebpackPlugin
// } = require('clean-webpack-plugin'); // 自动清理上次build的文件插件
const CopyWebpackPlugin = require('copy-webpack-plugin'); // 自动拷贝文件
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin'); // 抽离Css
const OptimizeCssPlugin = require('optimize-css-assets-webpack-plugin'); // 压缩CSS
const apiMocker = require('mocker-api'); // 模拟数据
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin; // 查看打包体积

module.exports = {
  mode: isDev ? 'development' : 'production',
  devtool: 'inline-source-map', // inline-|hidden-|eval- 将浏览器打印内容映射到代码对应行

  // entry: './src/index.js', //webpack的默认配置
  // 为数组时，表示有“多个主入口”，想要多个依赖文件一起注入时，会这样配置
  entry: {
    // './src/polyfills.js', // 文件中可能只是简单的引入了一些 polyfill，例如 babel-polyfill，whatwg-fetch 等，需要在最前面被引入
    index: './src/index.js',
    login: './src/login.js'
  },

  // webpack5自带热更新，如果package.json内配置了browserslist会导致热更新失效，开发环境下取消此配置即可
  target: process.env.NODE_ENV === "development" ? "web" : "browserslist",

  output: {
    path: path.resolve(__dirname, 'dist'), //必须是绝对路径
    filename: '[name].[fullhash:6].js', // 考虑到CDN缓存的问题，我们一般会给文件名加上 hash，可以指定hash长度[hash:6]
    publicPath: isDev ? '/' : './', //通常是CDN地址
    /*例如，你最终编译出来的代码部署在 CDN 上，资源的地址为: 'https://AAA/BBB/YourProject/XXX'，那么可以将生产的 publicPath 配置为: //AAA/BBB/。
     *编译时，可以不配置，或者配置为 /。可以在我们之前提及的 config.js 中指定 publicPath（config.js 中区分了 dev 和 public）， 
     *当然还可以区分不同的环境指定配置文件来设置，或者是根据 isDev 字段来设置
     */
    clean: true // 清理build文件，webpack5通过此属性
  },

  module: {
    // loader配置
    rules: [
      // babel将代码转换成兼容模式
      {
        test: /\.jsx?$/,
        use: {
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
        },
        exclude: /node_modules/
      },

      // 样式加载
      {
        test: /\.(le|c)ss$/,
        use: [
          // 抽离CSS
          isDev ? 'style-loader' : {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: '../', // 如果你的output的publicPath配置的是 './' 这种相对路径，那么如果将css文件放在单独目录下，记得在这里指定一下publicPath
            },
          }, 'css-loader', 'postcss-loader', 'less-loader'
        ],
        exclude: /node_modules/
      },

      // 图片加载
      {
        test: /\.(png|jpg|gif|jpeg|webp|svg|eot|ttf|woff|woff2)$/,
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize: 10 * 1024 // 4kb
          }
        },
        generator: {
          filename: 'assets/imgs/[hash:6][ext][query]'
        },
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

    ]
  },

  // 插件配置
  plugins: [
    // html插件，用于打包html文件，通过config可以配置html加载内容
    new HtmlWebpackPlugin({
      template: './public/view/index.html',
      filename: 'index.html', // 打包后的文件名
      // chunks: ['index'], // 只加载对应的js
      minify: {
        removeAttributeQuotes: false, // 是否删除属性的双引号
        collapseWhitespace: false, // 是否折叠空白
      },
      config: config.template
      // hash: true // 是否加上hash，默认false
    }),
    // 多页面配置
    new HtmlWebpackPlugin({
      template: './public/view/login.html',
      filename: 'login.[fullhash:6].html', //打包后的文件名
      chunks: ['login']
    }),

    // 自动清理打包文件 不需要传参数喔，它可以找到 outputPath
    // new CleanWebpackPlugin({
    //   cleanOnceBeforeBuildPatterns: ['**/*', '!dll', '!dll/**'] //不删除dll目录下的文件
    // })

    // 复制文件到打包文件夹
    new CopyWebpackPlugin({
      patterns: [{
        from: 'public/js/*.js',
        to: path.resolve(__dirname, 'dist/js', '[name].js'),
        // to: 'js/[name].js', // webpack5 上面和这里 只复制文件而不复制目录
        globOptions: {
          ignore: ['**/other.js'] // webpack5 忽略文件写法"**/file.*"，忽略目录为"**/ignored-directory/**"
        }
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

    // 抽离CSS
    new MiniCssExtractPlugin({
      filename: 'css/[name].css',
    }),

    // 压缩CSS
    new OptimizeCssPlugin(),

    // 热更新
    // new webpack.HotModuleReplacementPlugin(),

    // 定义环境变量，直接在代码使用 //if(DEV === 'dev') {//开发环境}else {//生产环境}
    new webpack.DefinePlugin({
      DEV: JSON.stringify(isDev ? 'dev' : 'prod'), //字符串
      FLAG: 'true' //FLAG 是个布尔类型
    }),

    
    // 打包体积
    new BundleAnalyzerPlugin(),
  ],

  // 服务配置
  devServer: {
    port: '3000', //默认是8080
    quiet: false, //默认不启用, 启用后，除了初始启动信息之外的任何内容都不会被打印到控制台
    inline: true, //默认开启 inline 模式，如果设置为false,开启 iframe 模式
    stats: "errors-only", //终端仅打印 error
    overlay: false, //默认不启用，启用后编译出错在浏览器窗口全屏输出错误
    clientLogLevel: "silent", //日志等级 当使用内联模式时，在浏览器的控制台将显示消息，如：在重新加载之前，在一个错误之前，或者模块热替换启用时。如果你不喜欢看这些信息，可以将其设置为 silent (none 即将被移除)。
    compress: true, //是否启用 gzip 压缩
    // hot: true // 热更新
    // 服务代理
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        secure: false, // 协议是https的时候必须要写
        changeOrigin: true,
        pathRewrite: {
          '/api': ''
        }
      }
    },
    /**
     * 模拟数据 直接请求 /user 接口。
     * fetch("user")
     * .then(response => response.json())
     * .then(data => console.log(data))
     * .catch(err => console.log(err));
     */
    // before(app) {
    //   app.get('/user', (req, res) => {
    //     res.json({
    //       name: 'lisi'
    //     })
    //   })
    // }
    /**
     * 模拟mock数据
     */
    before(app) {
      apiMocker(app, path.resolve('./mock/mocker.js'))
    }
  },

  // 优化
  optimization: {
    // 生产模式压缩CSS
    // minimizer: [
    //   // 在 webpack@5 中，你可以使用 `...` 语法来扩展现有的 minimizer（即 `terser-webpack-plugin`），将下一行取消注释
    //   // `...`,
    //   // new CssMinimizerPlugin(),
    // ],
    // minimize: true,

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
    mainFields: ['style', 'main']

  },

  // 不打包
  externals: {
    //jquery通过script引入之后，全局中即有了 jQuery 变量
    'jquery': 'jQuery'
  }
}