const mongoose = require('mongoose');

const stockTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
  },
}, { timestamps: true });

module.exports = mongoose.model('StockType', stockTypeSchema);
