const mongoose = require("mongoose");

const assetTypeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AssetCategory",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AssetType", assetTypeSchema);
