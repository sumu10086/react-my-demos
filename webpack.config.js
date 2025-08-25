const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
  entry: "./src/index.js", // 你的入口文件
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle.js", // 输出的主 JS 文件
  },
  module: {
    rules: [
      // 处理 JavaScript 文件
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
          },
        },
      },
      // 处理 SCSS 文件
      {
        test: /\.scss$/,
        use: [
          process.env.NODE_ENV === "development"
            ? "style-loader"
            : MiniCssExtractPlugin.loader,
          "css-loader",
          "postcss-loader", // 用于自动添加浏览器前缀
          "resolve-url-loader", // 解决路径问题
          {
            loader: "sass-loader",
            options: {
              sourceMap: true, // 启用 sourceMap
            },
          },
        ],
      },
      // 处理图片文件
      {
        test: /\.(png|jpe?g|gif|svg)$/,
        use: [
          {
            loader: "file-loader",
            options: {
              name: "[name].[hash].[ext]",
              outputPath: "images/",
            },
          },
        ],
      },
      // 处理字体文件
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        use: [
          {
            loader: "file-loader",
            options: {
              name: "[name].[hash].[ext]",
              outputPath: "fonts/",
            },
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: [".js", ".jsx", ".json", ".scss"], // 支持的文件扩展名
  },
  plugins: [
    // 自动生成 HTML 文件并注入打包的 JS 文件
    new HtmlWebpackPlugin({
      template: "./src/index.html", // 你的 HTML 模板
      filename: "index.html",
    }),
    // 提取 CSS 到独立文件
    new MiniCssExtractPlugin({
      filename: "[name].[contenthash].css",
      chunkFilename: "[id].[contenthash].css",
    }),
  ],
  devtool: "source-map", // 生成 source maps 便于调试
  devServer: {
    contentBase: path.join(__dirname, "dist"),
    compress: true,
    port: 9000, // 本地开发服务器端口
    open: true, // 自动打开浏览器
    hot: true, // 启用热模块替换
  },
};
