'use strict';

const express = require('express');
const wrap = require('co-express');
const encrypt = require('../lib/encrypt');
const connect = require('../lib/connect')

const router = module.exports = express.Router();
const db_name = process.env.db_name || 'sequelize_demo_kilin'
const getRandomColor = () => {
  let letters = '0123456789ABCDEF'.split('');
  let color = '#';
  for (let i = 0; i < 6; i++ ) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

router.post('/', wrap(function*(req, res, next) {
  const login = req.body.login;
  const password = req.body.password;

  if (!login || !password) {
    return res.redirect('/login');
  }

  let encrypt_pwd = encrypt.sha1(encrypt.md5(password + req.app.get('salt1')) + req.app.get('salt2'));
  let color = getRandomColor()
  let status = yield req.dbKnex('users').withSchema(db_name).insert({
    login: login,
    password: encrypt_pwd,
    color: color
  })

  res.json({status: status[0]})
  next()
}), (err, req, res, next) => {
  if (req.dbKnex) {
    req.dbKnex.destroy();
    req.dbKnex = null;
  }
  next(err);
});
