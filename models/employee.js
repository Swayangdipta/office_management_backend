const mongoose = require('mongoose')

const employeeSchema = new mongoose.Schema({
    fullname: String,
    date_of_birth: Date,
    cid: String,
    emp_id: {
        type: String,
        unique: true
    },
    tpn_acc_num: String,
    has_gis: Boolean,
    gis_acc_num: String,
    has_pf: Boolean,
    pf_acc_num: String,
    sav_acc_num: String,
    bank_name: String,
    bank_branch: String,
    benefits: {
        type: Object
    },
    deductions: {
        type: Object
    },
    qualifications: []
},{timestamps: true})

module.exports = mongoose.model('Employee',employeeSchema)