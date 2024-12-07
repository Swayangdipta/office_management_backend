const Administrator = require('../models/administrator')
const EndUser = require('../models/endUser')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const {expressjwt} = require('express-jwt')

const maxEndUsers = process.env.MAX_END_USERS
const accesses = {
    HRS: 'Human Resource System',
    SARS: 'Stock and Asset Registration System',
    AS: 'Accounting System'
}

const roles = {
    HRM: 'Human Resource Manager',
    SAM: 'Store and Asset Manager',
    AM: 'Accounts Manager'
}

const getTotalEndUsers = async (req,res) => {
    try {
        const totalUsers = await EndUser.find()

        if(!totalUsers){
            return res.status(404).json({error: "Something went wrong.", message: totalUsers})
        }

        return totalUsers.length;
    } catch (error) {
        console.log(error);
        
        return 4
    }
}

exports.createAdmin = async (req,res) => {
    try {
        const {name, role, password, confirmPassword} = req.body

        if(!name || !role || !password || !confirmPassword){
            return res.status(400).json({error: "Please provide the mandatory data.", message: {name,role,password,confirmPassword}})
        }

        if(password !== confirmPassword) {
            return res.status(400).json({error: "Passwords did not matched.", message: {password,confirmPassword}})
        }
        const SALT = parseInt(process.env.SALT)
        const hashedPassword = await bcrypt.hash(password,SALT)

        const admin = new Administrator(req.body)
        admin.password = hashedPassword

        const savedAdmin = await admin.save()

        if(!savedAdmin || savedAdmin.errors){
            return res.status(400).json({error: "Faild to create administrator.", message: savedAdmin.errors})
        }

        return res.status(200).json({success: "Account created successfully."})

    } catch (error) {
        return res.status(500).json({error: 'Internal Server Error!', message: error})
    }
}

exports.loginAdmin = async (req,res) => {
    try {
        const {name, password} = req.body

        if(!name || !password){
            return res.status(400).json({error: "Please provide the mandatory data.", message: "Insufficient data"})
        }

        const admin = await Administrator.findOne({name})

        if(!admin || admin.errors){
            return res.status(404).json({error: "No account found.", message: admin.errors})
        }

        const checkPassword = await bcrypt.compare(password, admin.password)

        if(!checkPassword){
            return res.status(400).json({error: "Incorrect Username/Password", message: password})
        }

        const token = jwt.sign({userId: admin._id},process.env.JWT_SECRET)
        res.cookie('token',token,{"maxAge": 2 * 60 * 60 * 1000})

        admin.password = undefined
        admin.createdAt = undefined
        admin.updatedAt = undefined
        admin.__v = undefined

        return res.status(200).json({success: "Login successful.",admin,token})

    } catch (error) {
        console.log(error);
        
        return res.status(500).json({error: 'Internal Server Error!', message: error})
    }
}

exports.getAccess = (req,res) => {
    return res.status(200).json(accesses)
}

exports.createEndUsers = async (req,res) => {
    try {
        const {name, role, password, confirmPassword, email, contact} = req.body

        const totalUsers = await getTotalEndUsers()
        
        if(totalUsers > 2){
            return res.status(400).json({error: 'Maximum accounts created.'})
        }

        if(!name || !role || !password || !confirmPassword || !email || !contact){
            return res.status(400).json({error: "Please provide the mandatory data.", message: {name,role,password,confirmPassword,email,contact}})
        }

        if(password !== confirmPassword) {
            return res.status(400).json({error: "Passwords did not matched.", message: {password,confirmPassword}})
        }

        if(role === 'HRM' || role === 'AM' || role === 'SAM'){
            // 
        }else{
            return res.status(404).json({error: 'No such roles available.'})
        }

        const SALT = parseInt(process.env.SALT)
        const hashedPassword = await bcrypt.hash(password,SALT)

        const picture = `https://avatar.iran.liara.run/username?username=${name}`

        const endUser = new EndUser(req.body)
        endUser.password = hashedPassword

        const savedEndUser = await endUser.save()

        if(!savedEndUser || savedEndUser.errors){
            return res.status(400).json({error: "Faild to create user.", message: savedEndUser.errors})
        }

        return res.status(200).json({success: "Account created successfully."})

    } catch (error) {
        return res.status(500).json({error: 'Internal Server Error!', message: error})
    }
}

exports.loginEndUser = async (req,res) => {
    try {
        const {email, password} = req.body

        if(!email || !password){
            return res.status(400).json({error: "Please provide the mandatory data.", message: "Insufficient data"})
        }
        
        const endUser = await EndUser.findOne({email})

        if(!endUser || endUser.errors){
            return res.status(404).json({error: "No account found.", message: endUser.errors})
        }

        const checkPassword = await bcrypt.compare(password, endUser.password)

        if(!checkPassword){
            return res.status(400).json({error: "Incorrect Username/Password", message: password})
        }

        const token = jwt.sign({userId: endUser._id},process.env.JWT_SECRET)
        res.cookie('token',token,{"maxAge": 2 * 60 * 60 * 1000})

        endUser.password = undefined
        endUser.createdAt = undefined
        endUser.updatedAt = undefined
        endUser.__v = undefined

        return res.status(200).json({success: "Login successful.",endUser,token})

    } catch (error) {
        console.log(error);
        
        return res.status(500).json({error: 'Internal Server Error!', message: error})
    }
}

exports.logout = (req,res) => {
    res.clearCookie("token")
    return res.status(200).json({success: true,message: "User signed out!"})
}

exports.isSignedIn = expressjwt({
    secret: process.env.JWT_SECRET,
    algorithms: ["SHA256","SHA512","HS256","RS256","sha1",'RSA'],
    userProperty: "auth"
})

exports.isAuthenticated = (req,res,next) => {
    let checker = req.profile && req.auth && req.profile._id == req.auth._id

    if(!checker){
        return res.status(403).json({errors: ["Access Denied."]})
    }

    next()
}

exports.isAdministrator = (req,res,next) => {
    try {
        if(req.profile.role !== 'admin'){
            return res.status(403).json({errors: ["You don't have admin rights."]})
        }

        next()
    } catch (error) {
        return res.status(500).json({error: 'Internal Server Error!', message: error})
    }
}

exports.hasHRMRights = (req,res,next) => {
    try {
        if(req.endUser.role !== 'HRM'){
            return res.status(403).json({errors: ["You don't have the rights."]})
        }

        next()
    } catch (error) {
        return res.status(500).json({error: 'Internal Server Error!', message: error})
    }
}

exports.hasSAMRights = (req,res,next) => {
    try {
        if(req.endUser.role !== 'SAM'){
            return res.status(403).json({errors: ["You don't have the rights."]})
        }

        next()
    } catch (error) {
        return res.status(500).json({error: 'Internal Server Error!', message: error})
    }
}

exports.hasAMRights = (req,res,next) => {
    try {
        if(req.endUser.role !== 'AM'){
            return res.status(403).json({errors: ["You don't have the rights."]})
        }

        next()
    } catch (error) {
        return res.status(500).json({error: 'Internal Server Error!', message: error})
    }
}