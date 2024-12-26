const Administrator = require("../models/administrator");
const Designations = require("../models/designations");
const EndUser = require('../models/endUser')
// Import your Mongoose models
const Employee = require('../models/employee');
const AssetDetail = require('../models/assetDetails');
const StockDetail = require('../models/stockDetails');
const Voucher = require('../models/voucher');
const BankTransaction = require('../models/bankTransaction');
const ApprovingAuthority = require("../models/approvingAuthority");

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

exports.getApprovingAuthorityById = async (req,res,next,id) => {
    try {
        const approvingAuthority = await ApprovingAuthority.findById(id)
        if(!approvingAuthority || approvingAuthority.errors){
            return res.status(404).json({error: 'Authority not found!', message: approvingAuthority})
        }
        req.approvingAuthority = approvingAuthority
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

exports.pushIntoDesignation = async (req, res) => {
    try {
      if (!req.savedEmployee || !req.savedEmployee._id) {
        return res.status(400).json({ error: 'Invalid employee data provided.' });
      }
  
      const designation = req.designation; // Assume middleware populates this
      const updatedDesignation = await Designations.findByIdAndUpdate(
        designation._id,
        { $push: { employees: req.savedEmployee._id } },
        { new: true }
      );
  
      if (!updatedDesignation) {
        return res.status(400).json({ error: 'Failed to push employee into designation!' });
      }
  
      return res.status(200).json({
        success: 'Employee pushed into designation successfully!',
        designation: updatedDesignation,
      });
    } catch (error) {
      return res.status(500).json({ error: 'Internal Server Error!', message: error.message });
    }
};
  
exports.popFromDesignation = async (req, res) => {
    try {
        if (!req.deletedEmployee || !req.deletedEmployee._id) {
        return res.status(400).json({ error: 'Invalid employee ID provided.' });
        }

        const designation = await Designations.findOne({ employees: req.deletedEmployee._id });

        if (!designation) {
        return res.status(400).json({ error: 'No designation found for the given employee ID' });
        }

        const updatedDesignation = await Designations.findByIdAndUpdate(
        designation._id,
        { $pull: { employees: req.deletedEmployee._id } },
        { new: true }
        );

        if (!updatedDesignation) {
        return res.status(400).json({ error: 'Failed to pop employee from designation!' });
        }

        return res.status(200).json({
        success: 'Employee removed from designation successfully!',
        designation: updatedDesignation,
        });
    } catch (error) {
        return res.status(500).json({ error: 'Internal Server Error!', message: error.message });
    }
};

exports.createApprovingAuthority = async (req,res) => {
    try {
        const {name, cid, email} = req.body
        if(!name || !cid || !email){
            return res.status(400).json({error: 'Please provide the mandatory data.', message: {name,cid,email}})
        }

        const approvingAuthority = await ApprovingAuthority.create(req.body)

        if(!approvingAuthority || approvingAuthority.errors ){
            return res.status(400).json({error: 'Failed to create approving authority!', data: approvingAuthority.errors})
        }

        return res.status(200).json({success: 'Approving Authority created successfully!', data: approvingAuthority })
    } catch (error) {
        return res.status(500).json({error: 'Internal Server Error!', data: error})
    }
}

exports.getApprovingAuthorities = async (req,res) => {
    try {
        const authorities = await ApprovingAuthority.find()
        
        if(!authorities || authorities.errors ){
            return res.status(404).json({error: 'No authorities found!'})
        }
        return res.status(200).json({success: 'Approving Authorities found successfully!', data: authorities})
    } catch (error) {
        return res.status(500).json({error: 'Internal Server Error!', message: error})
    }
}

exports.removeApprovingAuthority = async (req, res) => {
    try {
      const approvingAuthority = req.approvingAuthority;
  
      // Delete the approving authority
      await approvingAuthority.deleteOne();
  
      return res.status(200).json({ success: 'Approving authority removed successfully!', data: approvingAuthority });
    } catch (error) {
      return res.status(500).json({ error: 'Internal Server Error!', message: error.message });
    }
};