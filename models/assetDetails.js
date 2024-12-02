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
  }, { timestamps: true });
  
module.exports = mongoose.model("AssetDetails", assetDetailsSchema);  