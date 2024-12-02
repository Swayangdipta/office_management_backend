const mongoose = require('mongoose');

const stockDetailsSchema = new mongoose.Schema({
  stockType: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StockType',
    required: true,
  },
  registrationId: {
    type: String,
    required: true,
  },
  model: {
    type: String,
    required: true,
  },
  purchaseDate: {
    type: Date,
    required: true,
  },
  purchaseValue: {
    type: Number,
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('StockDetails', stockDetailsSchema);
