const mongoose = require('mongoose');

const bankSchema = new mongoose.Schema({
    name: String,
    account_num: Number,
    branch: String,
    ifsc: String,
    account_type: {
        type: String,
        enum: ['Current', 'Savings'],
        default: 'Savings'
    },
},{timestamps: true})

module.exports = mongoose.model('Bank', bankSchema)