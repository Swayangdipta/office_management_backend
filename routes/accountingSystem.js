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
router.post('/am/party-master/create', createParty);        // Create
router.put('/am/party-master/:partyId', updateParty);           // Update
router.delete('/am/party-master/:partyId', deleteParty);       // Delete
router.post('/am/party-master/all', getAllParties);             // Get All

// Voucher Preparation (End User)
router.post('/am/voucher/create', createVoucher);           // Create Voucher
router.put('/am/voucher/:voucherId', updateVoucher);               // Update Voucher
router.post('/am/voucher/v/:voucherId', getVoucher);                  // Get Voucher
router.post('/am/voucher', getAllVouchers);                  // Get Voucher
router.post('/am/voucher/ah', getAllAccountingHeads);                  // Get Voucher

// Transaction Entry (End User)
// router.post('/am/voucher/transaction', createTransaction);   // Add Transaction

// Bank Reconciliation (End User)
router.post('/am/bank-reconciliation/create', createBankTransaction); // Generate Bank Statement
router.post('/am/bank-reconciliation/statement', generateBankStatement); // Generate Bank Statement
router.post('/am/bank-reconciliation/reconcile/:transactionId', reconcileTransaction); // Reconcile Bank Transactions

// Process (End User)
router.post('/am/process/close-month', closeMonth);  // Month Closing
router.post('/am/process/close-year', closeYear);    // Year Closing

// Reports (End User)
router.get('/am/reports/trial-balance', trialBalance);        // Trial Balance Report
router.get('/am/reports/profit-loss', profitAndLoss);          // Profit and Loss Account
router.get('/am/reports/balance-sheet', balanceSheet);         // Balance Sheet
router.get('/am/reports/ledgers', ledgers);                    // Ledgers

module.exports = router;