const mongoose = require('mongoose');

const companyProfileSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    logo: {
        type: String,
    },
    banks: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Bank'
    }]
},{timestamps: true})

module.exports = mongoose.model('CompanyProfile', companyProfileSchema)