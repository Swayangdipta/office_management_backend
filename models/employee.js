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
    designation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Designations'
    },
    emp_type: {
        type: String
    },
    benefits: {
        type: Object
    },
    deductions: {
        type: Object
    },
    qualifications: [],
    is_active: {
        type: Boolean,
        default: true
    }
},{timestamps: true})

module.exports = mongoose.model('Employee',employeeSchema)