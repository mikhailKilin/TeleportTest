module.exports = [
  require("./make-webpack-config")({
    separateStylesheet: true,
    minimize: true
  })
];
