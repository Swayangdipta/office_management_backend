const Administrator = require("../models/administrator");
const Designations = require("../models/designations");
const EndUser = require('../models/endUser')

exports.getAdminById = async (req,res,next,id) => {
    try {
        const admin = await Administrator.findById(id)

        if(!admin || admin.errors){
            return res.status(404).json({error: 'Account not found!', message: admin.errors})
        }

        req.profile = admin

        next()
    } catch (error) {
        return res.status(500).json({error: 'Internal Server Error!', message: error})
    }
}

exports.getEndUserById = async (req,res,next,id) => {
    try {
        const endUser = await EndUser.findById(id)
        if(!endUser || endUser.errors){
            return res.status(404).json({error: 'Account not found!', message: endUser})
        }
        req.endUser = endUser
        next()
    } catch (error) {

        return res.status(500).json({error: 'Internal Server Error!', message: error})
    }
}

exports.getDesignationById = async (req,res,next,id) => {
    try {
        const designation = await Designations.findById(id)
        if(!designation || designation.errors){
            return res.status(404).json({error: 'Account not found!', message: designation})
        }
        req.designation = designation
        next()
    } catch (error) {

        return res.status(500).json({error: 'Internal Server Error!', message: error})
    }
}

exports.createDesignation = async (req,res) => {
    try {
        if(!req.body.title){
            return res.status(400).json({error: 'Title is required!'})
        }

        const designation = await Designations.create(req.body)

        if(!designation || designation.errors ){
            return res.status(400).json({error: 'Failed to create designation!', message: designation.errors})
        }

        return res.status(200).json({success: 'Designation created successfully!', message: designation })
    } catch (error) {
        return res.status(500).json({error: 'Internal Server Error!', message: error})
    }
}

exports.getDesignations = async (req,res) => {
    try {
        const designations = await Designations.find()
        if(!designations || designations.errors ){
            return res.status(404).json({error: 'No designations found!'})
        }
        return res.status(200).json({success: 'Designations found successfully!', message: designations})
    } catch (error) {
        return res.status(500).json({error: 'Internal Server Error!', message: error})
    }
}

exports.updateDesignation = async (req,res) => {
    try {
        const designation = req.designation

        if(!req.body.title){
            return res.status(400).json({error: 'Title is required!'})
        }

        designation.title = req.body.title

        const updatedDesignation = await designation.save()

        if(!updatedDesignation || updatedDesignation.errors ){
            return res.status(400).json({error: 'Failed to update designation!', message: updatedDesignation})
        }

        return res.status(200).json({success: 'Designation updated successfully!', message: updatedDesignation})

    } catch (error) {
        return res.status(500).json({error: 'Internal Server Error!', message: error})
    }
}

exports.removeDesignation = async (req,res) => {
    try {
        const designation = req.designation

        const deletedDesignation = await designation.remove()

        if(!deletedDesignation || deletedDesignation.errors ){
            return res.status(400).json({error: 'Failed to delete designation!', message: deletedDesignation})
        }

        return res.status(200).json({success: 'Designation deleted successfully!', message: deletedDesignation})
    } catch (error) {
        return res.status(500).json({error: 'Internal Server Error!', message: error})
    }   
}

exports.pushIntoDesignation = async (req,res) => {
    try {
        const designation = req.designation


        const updatedDesignation = await designation.updateOne({$push: {employees: req.savedEmployee._id}})

        if(!updatedDesignation || updatedDesignation.errors ){
            return res.status(400).json({error: 'Failed to push employee into designation!', message: updatedDesignation})
        }

        return res.status(200).json({success: 'Employee pushed into designation successfully!', message: updatedDesignation})
    } catch (error) {
        return res.status(500).json({error: 'Internal Server Error!', message: error})
    }
}

exports.popFromDesignation = async (req,res) => {
    try {
        const designation = await Designations.findOne({ employees: employeeId });

        if (!designation) {
            return res.status(400).json({error: 'No designation found for the given employee ID', message: designation})
        }

        const updatedDesignation = await designation.updateOne({$pull: {employees: req.savedEmployee._id}})

        if(!updatedDesignation || updatedDesignation.errors ){
            return res.status(400).json({error: 'Failed to pop employee from designation!', message: updatedDesignation})
        }
        

        return res.status(200).json({success: req.deletedEmployee, message: updatedDesignation})
    } catch (error) {
        return res.status(500).json({error: 'Internal Server Error!', message: error})
    }
}