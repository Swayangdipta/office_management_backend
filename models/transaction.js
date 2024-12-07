const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  transactionDate: {
    type: Date,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  debitAmount: {
    type: Number,
    required: true,
  },
  creditAmount: {
    type: Number,
    required: true,
  },
  accountHead: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "AccountingHead", // Link to the relevant Accounting Head
    required: true,
  },
  asset: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "AssetDetails", // Reference to the Asset involved in the transaction
  },
  stock: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "StockDetails", // Reference to the Stock involved in the transaction
  },
}, { timestamps: true });

module.exports = mongoose.model("Transaction", transactionSchema);