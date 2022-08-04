const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const StylelintPlugin = require("stylelint-webpack-plugin");
const ImageMinimizerPlugin = require("image-minimizer-webpack-plugin");

const resourceFolder = "../../build/resources/main/assets/";

// Get appName from gradle.properties
const fs = require("fs");

let appName = "defaultAppName";
const lines = fs.readFileSync("../../gradle.properties", "utf-8").split("\n");
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (line.startsWith("appName")) {
    appName = line.substring(line.indexOf("=") + 1).trim();
    break;
  }
}

module.exports = {
  entry: {
    main: "./scripts/main.es6",
    vendor: "./scripts/vendor.es6"
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: "css/[name].css"
    }),
    new StylelintPlugin({
      context: "./styles/"
    })
  ],
  module: {
    rules: [
      {
        test: /bootstrap\.native/,
        use: {
          loader: "bootstrap.native-loader",
          options: {
            only: ["collapse"]
          }
        }
      },
      {
        test: /\.(js|es6)?$/,
        use: "babel-loader",
        exclude: /node_modules/,
        include: [
          path.resolve(__dirname, "./scripts")
        ]
      },
      {
        test: /\.(scss|css)$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: "css-loader",
            options: {
              sourceMap: true
            }
          },
          {
            loader: "resolve-url-loader",
            options: {
              sourceMap: true
            }
          },
          {
            loader: "postcss-loader",
            options: {
              sourceMap: true
            }
          },
          {
            loader: "sass-loader",
            options: {
              sourceMap: true
            }
          }
        ]
      },
      {
        test: /\.(eot|ttf|woff|woff2)$/,
        use: [
          {
            loader: "file-loader?name=fonts/[name].[ext]&publicPath=../"
          }
        ]
      },
      {
        test: /\.(svg|gif|png|jp?g|webp)$/i,
        use: [
          {
            loader: "file-loader",
            options: {
              name: "images/[name].[ext]",
              publicPath: "../"
            }
          },
          {
            loader: ImageMinimizerPlugin.loader,
            options: {
              minimizer: {
                implementation: ImageMinimizerPlugin.imageminMinify,
                options: {
                  plugins: [
                    "imagemin-gifsicle",
                    "imagemin-pngquant",
                    "imagemin-svgo"
                  ]
                }
              }
            }
          }
        ]
      }
    ]
  },
  resolve: {
    extensions: [".es6", ".js"]
  },
  output: {
    filename: "js/[name].js",
    path: path.resolve(__dirname, resourceFolder),
    chunkFilename: "js/[name].chunk.js",
    publicPath: `/_/asset/${appName}:[hash]/`
  }
};
