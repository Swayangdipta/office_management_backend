const express = require('express');
const router = express.Router();
const hrmController = require('../controllers/hrm');  // Your HRM Controller // Your handlers
const { isSignedIn, hasHRMRights } = require('../controllers/auth');  // Any auth middleware if applicable
const { getEndUserById, pushIntoDesignation, getDesignations, getDesignationById, popFromDesignation } = require('../controllers/admin');  // Any auth middleware if applicable
const { getAccountingHeads } = require('../controllers/am');

// Params
router.param("empId",hrmController.getEmployeeById)
// router.param("euId",getEndUserById)
router.param("degnId",getDesignationById)

// Employee Routes
// router.get('/hrm/employee/:empId', isSignedIn, hasHRMRights, hrmController.getEmployeeById, hrmController.getEmployee);  // Get employee by empId
router.post('/hrm/employees' , hrmController.getEmployees);  // Create new employee
router.post('/hrm/employee/:empId' , hrmController.getEmployee);  // Create new employee
router.post('/hrm/employee/cr/:degnId', hrmController.createEmployee, pushIntoDesignation);  // Create new employee
router.put('/hrm/employee/:empId', hrmController.updateEmployee);  // Update employee by empId
router.put('/hrm/employee/status/:empId', hrmController.updateEmployeeActiveStatus);  // Update employee by empId
router.delete('/hrm/employee/:empId', hrmController.deleteEmployee,popFromDesignation);
// router.post('/hrm/roles/:hrmId',isSignedIn,hasHRMRights,hrmController.get)  // Delete employee by empId

// Designations
router.post('/hrm/designations', getDesignations)

// Pay Bill Routes
// router.get('/hrm/paybill/:payBillId', isSignedIn, getPayBillById, hrmController.getPayBill);  // Get pay bill by payBillId
router.post('/hrm/paybill/gen', hrmController.generatePay);  // Create new pay bill
router.post('/hrm/paybill', hrmController.getPayByEmployee);  // Create new pay bill
router.post('/hrm/paybill/post', hrmController.postPayBillForMonth);  // Create new pay bill
router.post('/hrm/paybill/preview', hrmController.getPayBillPreview);  // Create new pay bill
router.post('/hrm/paybill/undo', hrmController.undoPostPayBill);  // Create new pay bill
// router.put('/hrm/paybill/:payBillId', isSignedIn, getPayBillById, hrmController.updatePayBill);  // Update pay bill by payBillId
// router.delete('/hrm/paybill/:payBillId', isSignedIn, getPayBillById, hrmController.deletePayBill);  // Delete pay bill by payBillId

// Pay Slip Routes
router.post('/hrm/payslip', hrmController.getPaySlip);  // Get pay slip by paySlipId

router.post('/hrm/genlpc', hrmController.generateLPC);  // Generate LPC

// Remittance Routes
// router.get('/hrm/remittance/:remittanceId', isSignedIn, getRemittanceById, hrmController.getRemittance);  // Get remittance by remittanceId
router.post('/hrm/remittance/preview', hrmController.processRemittance);  // Create new remittance
router.post('/hrm/remittance', hrmController.saveRemittance);  // Create new remittance
router.post('/hrm/remittance/undo', hrmController.undoRemittance);  // Create new remittance
// router.put('/hrm/remittance/:remittanceId', isSignedIn, getRemittanceById, hrmController.updateRemittance);  // Update remittance by remittanceId
// router.delete('/hrm/remittance/:remittanceId', isSignedIn, getRemittanceById, hrmController.deleteRemittance);  // Delete remittance by remittanceId

router.post('/hrm/accounting-head', getAccountingHeads);  // Employee Report
router.post('/hrm/banks', hrmController.getBanks);  // Employee Report

// Report Routes
router.post('/hrm/reports/employee', hrmController.generateEmployeeMasterReport);  // Employee Report
router.post('/hrm/reports/paygeneration', hrmController.generatePayGenerationReport);  // Pay Generation Report
router.post('/hrm/reports/remittances', hrmController.generateRemittancesPostingReport);  // Remittances Report
router.post('/hrm/reports', hrmController.generatePayBillPostingReport);  // Pay Bill Posting Report

// Addon Routes
router.post("/hrm/pay-preview", hrmController.getPayPreview);

// Finalize or unfinalize pay
router.post("/hrm/pay-finalize", hrmController.finalizePayForMonth);

module.exports = router;