const mongoose = require("mongoose");

const payBillSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    basic_pay: {
      type: Number,
      required: true,
    },
    allowances: {
      type: Number,
      required: true,
    },
    tds: {
      type: Number,
      required: true,
    },
    pf: {
      type: Number,
      required: true,
    },
    gis: {
      type: Number,
      required: true,
    },
    gross_pay: {
      type: Number,
      required: true,
    },
    net_pay: {
      type: Number,
      required: true,
    },
    pay_date: {
      type: Date,
      required: true,
    },
    post_date: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["Pending", "Posted"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PayBill", payBillSchema);
