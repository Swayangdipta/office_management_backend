// routes/accountingSystem.js

const express = require('express');
const router = express.Router();

// Middleware for system admin authentication

// Controllers (importing everything from /controllers/am.js)
const {
  createParty,
  updateParty,
  deleteParty,
  getAllParties,
  createVoucher,
  updateVoucher,
  getVoucher,
  createTransaction,
  generateBankStatement,
  reconcileTransaction,
  closeMonth,
  closeYear,
  getPartyById,
  getVoucherById,
  getAllVouchers,
  getAllAccountingHeads,
  createBankTransaction,
  trialBalance,
  profitAndLoss,
  balanceSheet,
  ledgers
} = require('../controllers/am');

router.param('partyId',getPartyById)
router.param('voucherId',getVoucherById)

// ----------------------------- END USER ROUTES -----------------------------

// Party Master (End User)
router.post('/am/party-master/create/:euId', createParty);        // Create
router.put('/am/party-master/:partyId/:euId', updateParty);           // Update
router.delete('/am/party-master/:partyId/:euId', deleteParty);       // Delete
router.post('/am/party-master/all/:euId', getAllParties);             // Get All

// Voucher Preparation (End User)
router.post('/am/voucher/create/:euId', createVoucher);           // Create Voucher
router.put('/am/voucher/:voucherId/:euId', updateVoucher);               // Update Voucher
router.post('/am/voucher/v/:voucherId/:euId', getVoucher);                  // Get Voucher
router.post('/am/voucher/:euId', getAllVouchers);                  // Get Voucher
router.post('/am/voucher/ah/:euId', getAllAccountingHeads);                  // Get Voucher

// Transaction Entry (End User)
// router.post('/am/voucher/transaction', createTransaction);   // Add Transaction

// Bank Reconciliation (End User)
router.post('/am/bank-reconciliation/create/:euId', createBankTransaction); // Generate Bank Statement
router.post('/am/bank-reconciliation/statement/:euId', generateBankStatement); // Generate Bank Statement
router.post('/am/bank-reconciliation/reconcile/:euId/:transactionId', reconcileTransaction); // Reconcile Bank Transactions

// Process (End User)
router.post('/am/process/close-month/:euId', closeMonth);  // Month Closing
router.post('/am/process/close-year/:euId', closeYear);    // Year Closing

// Reports (End User)
router.get('/am/reports/trial-balance/:euId', trialBalance);        // Trial Balance Report
router.get('/am/reports/profit-loss/:euId', profitAndLoss);          // Profit and Loss Account
router.get('/am/reports/balance-sheet/:euId', balanceSheet);         // Balance Sheet
router.get('/am/reports/ledgers/:euId', ledgers);                    // Ledgers

module.exports = router;