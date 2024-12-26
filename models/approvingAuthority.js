const mongoose = require('mongoose')

const approvingAuthoritySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    cid: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    }
},{timestamps: true})

module.exports = mongoose.model('ApprovingAuthority',approvingAuthoritySchema)