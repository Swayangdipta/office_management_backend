const express = require('express');
const router = express.Router();
const hrmController = require('../controllers/hrm');  // Your HRM Controller // Your handlers
const { isSignedIn, hasHRMRights } = require('../controllers/auth');  // Any auth middleware if applicable
const { getEndUserById, pushIntoDesignation, getDesignations, getDesignationById, popFromDesignation } = require('../controllers/admin');  // Any auth middleware if applicable

// Params
router.param("empId",hrmController.getEmployeeById)
router.param("euId",getEndUserById)
router.param("degnId",getDesignationById)

// Employee Routes
// router.get('/hrm/employee/:empId', isSignedIn, hasHRMRights, hrmController.getEmployeeById, hrmController.getEmployee);  // Get employee by empId
router.post('/hrm/employees/:euId', isSignedIn, hasHRMRights, hrmController.getEmployees);  // Create new employee
router.post('/hrm/employee/:empId/:euId', isSignedIn, hasHRMRights, hrmController.getEmployee);  // Create new employee
router.post('/hrm/employee/:euId/:degnId', isSignedIn, hasHRMRights, hrmController.createEmployee,pushIntoDesignation);  // Create new employee
router.put('/hrm/employee/:empId/:euId', isSignedIn, hasHRMRights, hrmController.updateEmployee);  // Update employee by empId
router.delete('/hrm/employee/:empId/:euId', isSignedIn, hasHRMRights, hrmController.deleteEmployee,popFromDesignation);
// router.post('/hrm/roles/:hrmId',isSignedIn,hasHRMRights,hrmController.get)  // Delete employee by empId

// Designations
router.post('/hrm/designations/:euId', isSignedIn, hasHRMRights, getDesignations)

// Pay Bill Routes
// router.get('/hrm/paybill/:payBillId', isSignedIn, getPayBillById, hrmController.getPayBill);  // Get pay bill by payBillId
router.post('/hrm/paybill/gen/:euId', isSignedIn,hasHRMRights, hrmController.generatePay);  // Create new pay bill
router.post('/hrm/paybill/:euId', isSignedIn,hasHRMRights, hrmController.getPayByEmployee);  // Create new pay bill
router.post('/hrm/paybill/post/:euId', isSignedIn,hasHRMRights, hrmController.postPayBill);  // Create new pay bill
// router.put('/hrm/paybill/:payBillId', isSignedIn, getPayBillById, hrmController.updatePayBill);  // Update pay bill by payBillId
// router.delete('/hrm/paybill/:payBillId', isSignedIn, getPayBillById, hrmController.deletePayBill);  // Delete pay bill by payBillId

// Pay Slip Routes
router.post('/hrm/payslip/:euId', isSignedIn,hasHRMRights, hrmController.getPaySlip);  // Get pay slip by paySlipId

router.post('/hrm/genlpc', isSignedIn, hrmController.generateLPC);  // Generate LPC

// Remittance Routes
// router.get('/hrm/remittance/:remittanceId', isSignedIn, getRemittanceById, hrmController.getRemittance);  // Get remittance by remittanceId
router.post('/hrm/remittance/:euId', isSignedIn,hasHRMRights, hrmController.postRemittance);  // Create new remittance
// router.put('/hrm/remittance/:remittanceId', isSignedIn, getRemittanceById, hrmController.updateRemittance);  // Update remittance by remittanceId
// router.delete('/hrm/remittance/:remittanceId', isSignedIn, getRemittanceById, hrmController.deleteRemittance);  // Delete remittance by remittanceId

// Report Routes
router.get('/hrm/reports/employee/:empId', isSignedIn, hasHRMRights, hrmController.generateEmployeeMasterReport);  // Employee Report
router.get('/hrm/reports/paygeneration/:empId', isSignedIn,hasHRMRights, hrmController.generatePayGenerationReport);  // Pay Generation Report
router.get('/hrm/reports/:empId', isSignedIn,hasHRMRights, hrmController.generatePayBillPostingReport);  // Pay Bill Posting Report
router.get('/hrm/reports/remittances/:empId', isSignedIn, hasHRMRights, hrmController.generateRemittancesPostingReport);  // Remittances Report

module.exports = router;