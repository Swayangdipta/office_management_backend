const mongoose = require("mongoose");

const depreciationSchema = new mongoose.Schema(
  {
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AssetCategory",
      required: true,
      unique: true,
    },
    depreciationRate: {
      type: Number, // Percentage (e.g., 10 means 10%)
      required: true,
      min: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Depreciation", depreciationSchema);