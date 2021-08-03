// pressure.model.js
// schema for pressure reading at a given time.

const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  time: {
    type: Date,
    default: Date.now
  },

  pressure: Number
});

const Pressure = mongoose.model('Pressure', schema);
module.exports = Pressure;