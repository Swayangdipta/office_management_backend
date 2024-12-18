const Administrator = require("../models/administrator");
const Designations = require("../models/designations");
const EndUser = require('../models/endUser')
// Import your Mongoose models
const Employee = require('../models/employee');
const AssetDetail = require('../models/assetDetails');
const StockDetail = require('../models/stockDetails');
const Voucher = require('../models/voucher');
const BankTransaction = require('../models/bankTransaction');

exports.getTotals =  async (req, res) => {
  try {
    // Fetch counts for each collection
    const employeeCount = await Employee.countDocuments();
    const endUserCount = await EndUser.countDocuments();
    const assetDetailsCount = await AssetDetail.countDocuments();
    const stockDetailsCount = await StockDetail.countDocuments();
    const voucherCount = await Voucher.countDocuments();
    const bankTransactionCount = await BankTransaction.countDocuments();

    // Send the counts in the response
    res.json({
      employees: employeeCount,
      endUsers: endUserCount,
      assetDetails: assetDetailsCount,
      stockDetails: stockDetailsCount,
      vouchers: voucherCount,
      bankReconciliations: bankTransactionCount,
    });
  } catch (error) {
    console.error('Error fetching totals:', error);
    res.status(500).json({ error: 'An error occurred while fetching totals.' });
  }
}

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
            return res.status(400).json({error: 'Failed to create designation!', data: designation.errors})
        }

        return res.status(200).json({success: 'Designation created successfully!', data: designation })
    } catch (error) {
        return res.status(500).json({error: 'Internal Server Error!', data: error})
    }
}

exports.getDesignations = async (req,res) => {
    try {
        const designations = await Designations.find()
        
        if(!designations || designations.errors ){
            return res.status(404).json({error: 'No designations found!'})
        }
        return res.status(200).json({success: 'Designations found successfully!', data: designations})
    } catch (error) {
        return res.status(500).json({error: 'Internal Server Error!', message: error})
    }
}

exports.getEndUsers = async (req,res) => {
    try {
        const endUsers = await EndUser.find()
        
        if(!endUsers || endUsers.errors ){
            return res.status(404).json({error: 'No End Users found!'})
        }
        return res.status(200).json({success: 'End Users found successfully!', data: endUsers})
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
            return res.status(400).json({error: 'Failed to update designation!', data: updatedDesignation})
        }

        return res.status(200).json({success: 'Designation updated successfully!', data: updatedDesignation})

    } catch (error) {
        return res.status(500).json({error: 'Internal Server Error!', message: error})
    }
}

exports.removeDesignation = async (req,res) => {
    try {
        const designation = req.designation

        const deletedDesignation = await designation.deleteOne()

        if(!deletedDesignation || deletedDesignation.errors ){
            return res.status(400).json({error: 'Failed to delete designation!', data: deletedDesignation})
        }

        return res.status(200).json({success: 'Designation deleted successfully!', data: deletedDesignation})
    } catch (error) {
        return res.status(500).json({error: 'Internal Server Error!', data: error})
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