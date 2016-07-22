'use strict'
const websocketHelper = require('../lib/websocketHelper')
const express = require('express')
const wrap = require('co-express')
const router = module.exports = express.Router()
const connect = require('../lib/connect')
let cache
let CLIENTS = [];
const place_table = 'places'

const deleteReservedPlaces = (id, ws) => {
  let result
  let dbKnex = require('knex')(connect.connect)
  dbKnex.select('horisontalNumber', 'verticalnumber').from(place_table).where({
    user_id: id,
    reserved: 1
  }).then(ress => {
    result = ress
    return dbKnex(place_table).where('user_id', id).andWhere('buyed', '<>', 1).del()
  }).then((res)=> {
    for(let i=0;i< CLIENTS.length;i++){
      if(CLIENTS[i] === ws){
        CLIENTS = [
          ...CLIENTS.slice(0,i),
          ...CLIENTS.slice(i + 1)
        ]
      }
    }
    resetPlaces(result)
    dbKnex.destroy()
    dbKnex = null
  })
}

const resetPlaces = (data) => {
  for (var i = 0; i < CLIENTS.length; i++) {
    if(CLIENTS[i]){
      websocketHelper.sendMessage(CLIENTS[i], {
        type: websocketHelper.messageTypes.RESET_RESERVE,
        data: data
      })
    }
  }
}

const sendAll = (success, place) => {
  for (var i = 0; i < CLIENTS.length; i++) {
    if(CLIENTS[i]){
      websocketHelper.sendMessage(CLIENTS[i], {
        type: websocketHelper.messageTypes.SET_RESERVE,
        place: place,
        success: success
      })
    }
  }
}

const returnSetReserveMessage = (ws, success, place) => {
  websocketHelper.sendMessage(ws, {
    type: websocketHelper.messageTypes.SET_RESERVE,
    place: place,
    success: success
  })
}

const reservePlace = (dbKnex, req, horNumber, verNumber, reserve) => {
  const user = req.session.user
  return dbKnex.select('reserved', 'user_id').from(place_table).where({
    horisontalNumber: horNumber,
    verticalNumber: verNumber
  }).then((res) => {
    let place = res[0]
    if (place) {
      if ((!place.reserved /*&& !place.user_id*/) || place.user_id === user.id) {
        return dbKnex(place_table).update({
          reserved: reserve,
          user_id: user.id
        }).where({
          horisontalNumber: horNumber,
          verticalNumber: verNumber
        })
      } else {
        console.log('you cannot reserve reserved place')
        return false
      }
    } else {
      return dbKnex.insert({
        horisontalNumber: horNumber,
        verticalNumber: verNumber,
        reserved: reserve,
        user_id: user.id
      }).into(place_table)
    }
  })
}

const setReserve = (req, ws, data) => {
  let horNumber = data.horId
  let verNumber = data.verId
  let reserve = data.reserved === true ? 1 : 0
  let resPlace = {
    horNumber: horNumber,
    verNumber: verNumber,
    reserve: reserve,
    color: req.session.user.color
  }
  if (horNumber !== undefined && verNumber !== undefined) {
    let dbKnex = require('knex')(connect.connect)
    if (cache) {
      cache.then((res) => {
        return reservePlace(dbKnex, req, horNumber, verNumber, reserve)
      }).then((res) => {
        if (res !== false) {
          //returnSetReserveMessage(ws, true, resPlace)
          sendAll(true, resPlace)
        }
        dbKnex.destroy()
        dbKnex = null
      }).catch((err) => {
        dbKnex.destroy()
        dbKnex = null
        console.log('error when cache is define-----', err)
        cache = null
        //returnSetReserveMessage(ws, false)
        sendAll(false)
      })
    } else {
      cache = reservePlace(dbKnex, req, horNumber, verNumber, reserve)
        .then((res) => {
          if (res !== false) {
            //returnSetReserveMessage(ws, true, resPlace)
            sendAll(true, resPlace)
          }
          dbKnex.destroy()
          dbKnex = null
        }).catch((err) => {
          console.log('error when cache is undefined', err)
          returnSetReserveMessage(ws, false)
          sendAll(false)
          dbKnex.destroy()
          dbKnex = null
        })
    }
  } else {
    console.log('some wrong with data')
  }
}

const handleMessage = (req, ws, data) => {
  switch (data.type) {
    case websocketHelper.messageTypes.SET_RESERVE:
    {
      setReserve(req, ws, data)
    }
  }
}

router.ws('/', wrap(function*(ws, req, next) {
  if (req.session.user) {
    CLIENTS.push(ws);
    ws.on('message', function (msg) {
      let data = JSON.parse(msg)
      handleMessage(req, ws, data)
    })
    ws.on('open', function () {
      console.log('open')
    })
    ws.on('close', function () {
      console.log('close')
      deleteReservedPlaces(req.session.user.id, ws)

    })
  }
  next()
}))
