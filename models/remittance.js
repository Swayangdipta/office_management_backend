const mongoose = require("mongoose");

const remittanceSchema = new mongoose.Schema(
  {
    remittance_type: {
      type: String,
      enum: ["TDS", "PF", "GIS"], // Types of remittances
      required: true,
    },
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    remittance_date: {
      type: Date,
      required: true,
    },
    posting_date: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["Pending", "Completed"],
      default: "Pending",
    },
    bank: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bank'
    },
    signatory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AccountHead'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Remittance", remittanceSchema);
