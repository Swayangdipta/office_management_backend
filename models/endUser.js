const mongoose = require('mongoose')

const endUserSchema = new mongoose.Schema({
    name: {
        type: String,
        reuired: true
    },
    email:{
        type: String,
        reuired: true  
    },
    contact: {
        type: String,
        reuired: true
    },
    access: [],
    picture: {
        type: String,
        default: 'https://avatar.iran.liara.run/username?username='
    },
    role: {
        type: String
    },
    password: String
},{timestamps: true})

module.exports =  mongoose.model('EndUser',endUserSchema)