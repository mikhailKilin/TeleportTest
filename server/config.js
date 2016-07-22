'use strict'
let argv = require('yargs').default('production', false).argv;

module.exports = {
  port: process.env.PORT || 8000,
  url: 'http://localhost:8000',
  publicPath: process.env.devServer ? './public/production' : './public/development'
};