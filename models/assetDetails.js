const mongoose = require("mongoose");

const assetDetailsSchema = new mongoose.Schema({
    assetType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AssetType',
      required: true,
    },
    registrationId: {
      type: String, // Unique ID for the asset (e.g., government-issued)
      required: true,
      unique: true,
    },
    purchaseDate: {
      type: Date,
      required: true,
    },
    model: {
      type: String,
      required: false,
    },
    purchaseValue: {
      type: Number,
      required: true,
    },
    accountHead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AccountHead", // Reference to the Accounting Head model
      required: true,
    },
  }, { timestamps: true });
  
module.exports = mongoose.models.AssetDetails || mongoose.model('AssetDetails', assetDetailsSchema);