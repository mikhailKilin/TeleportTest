'use strict'

const express = require('express')
const wrap = require('co-express')
const encrypt = require('../lib/encrypt')

module.exports = (dev) => {
  const router = express.Router()

  router.get('/', wrap(function*(req, res, next) {
    if (req.session.user) {
      return res.redirect('/')
    } else {
      res.render('login', {dev: dev})
    }
    next()
  }))

  router.post('/', wrap(function*(req, res, next) {
    const login = req.body.login
    const password = req.body.password
    if (!login || !password) {
      next()
      return res.json({status: false})
    }

    let encrypt_pwd = encrypt.sha1(encrypt.md5(password + req.app.get('salt1')) + req.app.get('salt2'))

    let users = yield req.dbKnex.select('id','login', 'color')
      .from('users')
      .where({
        login: login,
        password: encrypt_pwd
      })
    if (!users[0]) {
      next()
      res.json({status: false})
    } else {
      let user = users[0]
      req.session.user = {
        id: user.id,
        login: user.login,
        color: user.color
      }
      req.session.cookie.maxAge = 30 * 24 * 3600 * 1000	// ~1 month
      res.json({status: true})
      next()
    }
  }), (err, req, res, next) => {
    if(req.dbKnex){
      req.dbKnex.destroy()
      req.dbKnex = null
    }
    next(err)
  })
  return router
}


