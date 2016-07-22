'use strict'
const http = require('http')
const session = require('express-session')
const express = require('express')
const wrap = require('co-express')
const config = require('./config')
const FileStore = require('session-file-store')(session)
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const path = require('path')
const connect = require('./lib/connect')

module.exports = function(options) {
  const sessionOptions = {
    store: new FileStore({ttl:7*24*3600}),
    name:   "sid",
    secret: "-wP27J-5Q^7|=VL",
    saveUninitialized: true,
    resave: true
  }
  let app = express()
  let expressWs = require('express-ws')(app)
  const login = require('./routes/login')(options.devServer)
  const cinema = require('./routes/cinema')(options.devServer)
  const signup = require('./routes/signup')
  const api = require('./routes/api')
  const websockets = require('./routes/websockets')

  app.set('views', path.join(__dirname, '..', 'views'))
  app.set('view engine', 'jade')
  app.set('x-powered-by', false)
  app.set('salt1', '-z;9^a3y6=dhZ%::94!d')
  app.set('salt2', 'U~1y6=7~+=.10!aq2=6D')
  app.use(bodyParser.json())
  app.use(cookieParser())
  app.use(bodyParser.urlencoded({ extended: true }))
  app.use(session(sessionOptions))

  // serve the static assets
  app.use("/_assets", express.static(path.join(__dirname, "..", "build", "public"), {
    maxAge: '200d'
  }))

  app.use('/', wrap(function*(req, res, next) {
    req.dbKnex = require('knex')(connect.connect)
    next()
  }))

  app.post('/logout', wrap(function*(req, res) {
    req.session.destroy((err) => {
      if(err){
        console.log(err)
      } else {
        res.clearCookie(sessionOptions.name)
        res.redirect('/login')
      }
    })
  }), (err, req, res, next) => {
    if (req.dbKnex) {
      req.dbKnex.destroy()
      req.dbKnex = null
    }
    next(err)
  })

  app.use('/login', login)
  app.use('/cinema', cinema)
  app.use('/signup', signup)
  app.use('/api', api)
  app.use('/websockets', websockets)
  app.get('/', wrap(function*(req, res, next) {
    if (!req.session.user) {
      res.redirect('/login')
    } else {
      res.redirect('/cinema')
    }
    next()
  }))

  app.use('/', wrap(function*(req, res, next) {
    if (req.dbKnex) {
      req.dbKnex.destroy()
      req.dbKnex = null
    }
    next()
  }))



  app.listen(config.port, function () {
    console.log('listening on http://localhost:' + config.port)
  })
}