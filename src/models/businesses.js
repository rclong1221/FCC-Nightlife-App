'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema

var Business = new Schema({
  yelp_id: { type: String, unique: true },
  going: [String]
})

module.exports = mongoose.model('Business', Business)
