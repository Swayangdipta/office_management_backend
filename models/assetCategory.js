const mongoose = require("mongoose");

const assetCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  assetTypes: [
    {
      type: String, // List of asset types (e.g., Vehicles, Buildings, Lands)
    },
  ],
  depreciationRate: {
    type: Number, // Depreciation rate percentage (e.g., 10 for 10%)
    required: false,
  },
}, { timestamps: true });

module.exports = mongoose.model("AssetCategory", assetCategorySchema);