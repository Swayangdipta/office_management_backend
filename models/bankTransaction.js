const mongoose = require('mongoose');

const BankTransactionSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    debit: {
      type: Number,
      default: 0,
    },
    credit: {
      type: Number,
      default: 0,
    },
    reconciled: {
      type: Boolean,
      default: false,
    },
    voucher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Voucher',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('BankTransaction', BankTransactionSchema);
