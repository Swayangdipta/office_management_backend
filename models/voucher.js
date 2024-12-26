const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema(
  {
    accountHead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AccountingHead',
      required: true,
    },
    subMajorHead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AccountingHead',
    },
    debit: {
      type: Number,
      // required: true,
    },
    credit: {
      type: Number,
      // required: true,
    },
  },
  { _id: false }
);

const VoucherSchema = new mongoose.Schema(
  {
    voucherId: {
      type: String
    },
    voucherNo: {
      type: String
    },
    entryDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    voucherType: {
      type: String,
      enum: ['Disbursement', 'Journal', 'Others'],
      required: true,
    },
    payee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Party',
      required: function () {
        return this.voucherType !== 'Others';
      },
    },
    narration: {
      type: String,
      required: true,
    },
    transactions: [TransactionSchema],
    isBalanced: {
      type: Boolean,
      default: false,
    },
    approvingAuthority: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ApprovingAuthority',
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Voucher', VoucherSchema);