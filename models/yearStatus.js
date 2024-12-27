const mongoose = require('mongoose');

const YearStatusSchema = new mongoose.Schema(
  {
    year: {
      type: Number,
      required: true,
    },
    closed: {
      type: Boolean,
      default: false, // Year will be open by default
    },
  },
  { timestamps: true } // Automatically add createdAt and updatedAt timestamps
);

const YearStatus = mongoose.model('YearStatus', YearStatusSchema);

module.exports = YearStatus;