const mongoose = require("mongoose");

const accountingHeadSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // Name of the accounting head
    type: { type: String, enum: ["major", "sub-major"], required: true }, // Type of head
    parent: { type: mongoose.Schema.Types.ObjectId, ref: "AccountingHead" }, // For sub-major heads
    asset: { type: Boolean, default: false }, // True if synced with SARS
    description: { type: String }, // Optional description
    assets: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "AssetDetails", // Reference to AssetDetails
      },
    ],
    stocks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "StockDetails", // Reference to StockDetails
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("AccountingHead", accountingHeadSchema);