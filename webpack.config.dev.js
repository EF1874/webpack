/*
 * @Author: 李聪
 * @Date: 2021-06-24 16:45:12
 * @LastEditors: 李聪
 * @LastEditTime: 2021-06-25 10:55:07
 * @Description: webpack开发环境配置
 */

const {
  merge
} = require('webpack-merge'); // 合并公共配置和开发配置方法
const path = require('path'); // 引入路径
const baseWebpackConfig = require('./webpack.config.base'); // 公共配置
const config = require('./public/config/config')['dev']; // 根据开发模式引入html配置
const HtmlWebpackPlugin = require('html-webpack-plugin'); // html插件引入
const CopyWebpackPlugin = require('copy-webpack-plugin'); // 自动拷贝文件
const webpack = require('webpack');
const apiMocker = require('mocker-api'); // 模拟数据

// 可以使用 merge 合并，也可以使用 merge.smart 合并，merge.smart 在合并loader时，会将同一匹配规则的进行合并
module.exports = merge(baseWebpackConfig, {
  mode: 'development',
  devtool: 'inline-source-map', // inline-|hidden-|eval- 将浏览器打印内容映射到代码对应行
  // webpack5自带热更新，如果package.json内配置了browserslist会导致热更新失效，开发环境下取消此配置即可
  target: "web",

  module: {
    rules: [
      // 样式加载, 开发环境不抽离CSS
      {
        test: /\.(le|c)ss$/,
        use: [
          'style-loader', 'css-loader', 'postcss-loader', 'less-loader'
        ],
        exclude: /node_modules/
      },
    ]
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
      config: config.template
      // hash: true // 是否加上hash，默认false
    }),

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

    // 定义环境变量，直接在代码使用 //if(DEV === 'dev') {//开发环境}else {//生产环境}
    new webpack.DefinePlugin({
      DEV: JSON.stringify('dev'), //字符串
      FLAG: 'true' //FLAG 是个布尔类型
    })
  ],
  
  // 服务配置,仅开发环境有效
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

});