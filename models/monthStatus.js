const mongoose = require('mongoose');

const MonthStatusSchema = new mongoose.Schema(
  {
    year: {
      type: Number,
      required: true,
    },
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12, // Months should be between 1 and 12
    },
    closed: {
      type: Boolean,
      default: false, // Month will be open by default
    },
  },
  { timestamps: true } // Automatically add createdAt and updatedAt timestamps
);

const MonthStatus = mongoose.model('MonthStatus', MonthStatusSchema);

module.exports = MonthStatus;