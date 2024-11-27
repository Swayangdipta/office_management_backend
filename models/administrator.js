const mongoose = require('mongoose')

const administratorSchema = new mongoose.Schema({
    name: {
        type: String,
        reuired: true
    },
    picture: {
        type: String,
        default: 'https://avatar.iran.liara.run/username?username=Administrator'
    },
    role: {
        type: String,
        default: 'admin'
    },
    password: String
},{timestamps: true})

module.exports =  mongoose.model('Administrator',administratorSchema)