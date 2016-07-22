'use strict'

const express = require('express')
const wrap = require('co-express')
module.exports = (dev) => {
  const router = express.Router()
  router.get('/', wrap(function* (req, res, next) {
    res.render('cinema',{dev: dev})
    next()
  }))
  return router
}



