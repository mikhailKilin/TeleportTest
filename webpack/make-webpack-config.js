var path = require("path");
var webpack = require("webpack");
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var StatsPlugin = require("stats-webpack-plugin");
var loadersByExtension = require("../config/loadersByExtension");

module.exports = function (options) {
  var entry;
  if (options.development) {
    entry = {

      index: [
        'webpack-dev-server/client?http://0.0.0.0:2992',
        'webpack/hot/only-dev-server',
        './client/index'
      ],
    };
  } else {
    entry = {
      index: './client/index',
    }
  }

  var loaders = {
    "js|jsx": {
      exclude: /\/node_modules\//,
      loaders: options.development ? ["react-hot", "babel-loader"] : ["babel-loader"],
      include: path.join(__dirname, "..", "client")
    },
    "ts|tsx": {
      exclude: /\/node_modules\//,
      loaders: ['react-hot', 'ts-loader']
    },
    "png|woff|woff2|eot|ttf": {
      exclude: /\/node_modules\//,
      loaders: ['url-loader?limit=100000']
    }
    /*"svg":{
     exclude: /(node_modules)/,
     loaders: ['svg-inline']
     }*/
  };

  var stylesheetLoaders = {
    "css": 'css-loader',
    "scss": ['css-loader', 'sass-loader']
  };

  var publicPath = options.development
    ? "http://localhost:2992/_assets/"
    : "/_assets/";
  var plugins = [];
  if (options.minimize) {
    plugins = [
      new webpack.PrefetchPlugin("react"),
      new webpack.PrefetchPlugin("react/lib/ReactComponentBrowserEnvironment"),
      new StatsPlugin(path.join(__dirname, "..", "build", options.development ? "stats-dev.json" : "stats.json"), {
        chunkModules: true
      }),
      new webpack.optimize.UglifyJsPlugin({
        compress: {
          warnings: false
        },
        sourceMap: true
      }),
      new webpack.optimize.DedupePlugin()
    ];
  }

  Object.keys(stylesheetLoaders).forEach(function (ext) {
    var stylesheetLoader = stylesheetLoaders[ext];
    if (Array.isArray(stylesheetLoader)) {
      stylesheetLoader = stylesheetLoader.join("!");
    }
    if (options.separateStylesheet) {
      stylesheetLoaders[ext] = ExtractTextPlugin.extract("style-loader", stylesheetLoader);
    } else {
      stylesheetLoaders[ext] = "style-loader!" + stylesheetLoader;
    }

  });

  if (options.separateStylesheet) {
    plugins = plugins.concat([
      new ExtractTextPlugin("[name].css", {
        allChunks: true
      })
    ]);
  }

  if (options.minimize) {
    plugins = plugins.concat([
      new webpack.optimize.UglifyJsPlugin({
        compressor: {
          warnings: false
        }
      }),
      new webpack.optimize.DedupePlugin()
    ]);
  }

  if (options.minimize) {
    plugins = plugins.concat([
      new webpack.DefinePlugin({
        "process.env": {
          NODE_ENV: JSON.stringify("production")
        }
      }),
      new webpack.NoErrorsPlugin()
    ]);
  }

  if (options.development) {
    plugins = plugins.concat([
      new webpack.HotModuleReplacementPlugin(),
      new webpack.NoErrorsPlugin(),
      new webpack.DefinePlugin({
        __DEVELOPMENT__: true,
        __DEVPANEL__: options.devPanel
      })
    ]);
  } else {
    plugins = plugins.concat([new webpack.DefinePlugin({
      __DEVELOPMENT__: false,
      __DEVPANEL__: false
    })]);
  }
  return {
    entry: entry,
    output: {
      path: path.join(__dirname, "..", "build", options.development ? "development" : "public"),
      publicPath: publicPath,
      filename: "[name].js",
      chunkFilename: "[id].js",
      pathinfo: options.debug
    },
    watch: true,
    target: 'web',
    module: {
      loaders: loadersByExtension(loaders).concat(loadersByExtension(stylesheetLoaders))
    },
    devtool: options.devtool,
    debug: options.debug,
    resolveLoader: {
      root: path.join(__dirname, '..', "node_modules")
    },
    resolve: {
      root: path.join(__dirname, "..", "app"),
      modulesDirectories: ['node_modules'],
      extensions: ["", ".web.js", ".js", ".§", ".ts", ".tsx"]
    },
    plugins: plugins,
    devServer: {
      stats: {
        cached: false
      }
    }
  };
};
