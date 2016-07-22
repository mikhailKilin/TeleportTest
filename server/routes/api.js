'use strict';

const express = require('express');
const wrap = require('co-express');
const router = module.exports = express.Router();
const user_table = 'users'
const places_table = 'places'
router.get('/user-info', wrap(function*(req, res, next) {
  let user = req.session.user
  let all_users = yield req.dbKnex.select('id', 'color').from(user_table)
  let places = yield req.dbKnex.select('horisontalNumber', 'verticalNumber', 'user_id').from(places_table)
    .where('reserved', 1).orWhere('buyed', 1)
  res.json({
    userInfo: user,
    all_users: all_users,
    places: places
  })
  next()
}))

router.post('/save-places', wrap(function*(req, res, next) {
  yield req.dbKnex(places_table).update({
    buyed: 1
  }).where({
    reserved: 1,
    user_id: req.session.user.id
  })
  yield req.dbKnex(places_table).update({
    buyed: 0
  }).where({
    reserved: 0,
    user_id: req.session.user.id
  })
  res.json({
    success: true
  })
  next()
}))

