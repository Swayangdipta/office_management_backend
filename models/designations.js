const mongoose = require('mongoose')

const designationSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    employees: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employee"
    }]
},{timestamps: true})

module.exports = mongoose.model("Designations",designationSchema)