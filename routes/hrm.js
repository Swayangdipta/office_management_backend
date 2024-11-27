const express = require('express');
const router = express.Router();
const hrmController = require('../controllers/hrm');  // Your HRM Controller // Your handlers
const { isSignedIn, hasHRMRights } = require('../controllers/auth');  // Any auth middleware if applicable
const { getEndUserById } = require('../controllers/admin');  // Any auth middleware if applicable

// Params
router.param("empId",hrmController.getEmployeeById)
router.param("euId",getEndUserById)

// Employee Routes
// router.get('/hrm/employee/:empId', isSignedIn, hasHRMRights, hrmController.getEmployeeById, hrmController.getEmployee);  // Get employee by empId
router.post('/hrm/employees/:euId', isSignedIn, hasHRMRights, hrmController.getEmployees);  // Create new employee
router.post('/hrm/employee/:empId', isSignedIn, hasHRMRights, hrmController.createEmployee);  // Create new employee
router.put('/hrm/employee/:empId', isSignedIn, hasHRMRights, hrmController.updateEmployee);  // Update employee by empId
router.delete('/hrm/employee/:empId', isSignedIn, hasHRMRights, hrmController.deleteEmployee);  // Delete employee by empId

// Pay Bill Routes
// router.get('/hrm/paybill/:payBillId', isSignedIn, getPayBillById, hrmController.getPayBill);  // Get pay bill by payBillId
router.post('/hrm/paybill/:empId', isSignedIn,hasHRMRights, hrmController.postPayBill);  // Create new pay bill
// router.put('/hrm/paybill/:payBillId', isSignedIn, getPayBillById, hrmController.updatePayBill);  // Update pay bill by payBillId
// router.delete('/hrm/paybill/:payBillId', isSignedIn, getPayBillById, hrmController.deletePayBill);  // Delete pay bill by payBillId

// Pay Slip Routes
router.get('/hrm/payslip/:empId', isSignedIn,hasHRMRights, hrmController.getPaySlip);  // Get pay slip by paySlipId
// router.post('/hrm/payslip', isSignedIn, hrmController.generatePaySlip);  // Generate new pay slip

// Remittance Routes
// router.get('/hrm/remittance/:remittanceId', isSignedIn, getRemittanceById, hrmController.getRemittance);  // Get remittance by remittanceId
router.post('/hrm/remittance/:empId', isSignedIn,hasHRMRights, hrmController.postRemittance);  // Create new remittance
// router.put('/hrm/remittance/:remittanceId', isSignedIn, getRemittanceById, hrmController.updateRemittance);  // Update remittance by remittanceId
// router.delete('/hrm/remittance/:remittanceId', isSignedIn, getRemittanceById, hrmController.deleteRemittance);  // Delete remittance by remittanceId

// Report Routes
router.get('/hrm/reports/employee/:empId', isSignedIn, hasHRMRights, hrmController.generateEmployeeMasterReport);  // Employee Report
router.get('/hrm/reports/paygeneration/:empId', isSignedIn,hasHRMRights, hrmController.generatePayGenerationReport);  // Pay Generation Report
router.get('/hrm/reports/:empId', isSignedIn,hasHRMRights, hrmController.generatePayBillPostingReport);  // Pay Bill Posting Report
router.get('/hrm/reports/remittances/:empId', isSignedIn, hasHRMRights, hrmController.generateRemittancesPostingReport);  // Remittances Report

module.exports = router;