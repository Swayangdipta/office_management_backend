const { getAdminById, createDesignation, getDesignationById, updateDesignation, removeDesignation, getDesignations, getEndUsers, getTotals, createApprovingAuthority, removeApprovingAuthority, getApprovingAuthorityById } = require('../controllers/admin')
const {
    createAssetCategory,
    updateAssetCategory,
    deleteAssetCategory,
    createAssetType,
    updateAssetType,
    deleteAssetType,
    setDepreciationRate,
    createStockType,
    updateStockType,
    deleteStockType,
    createDepreciation, updateDepreciation, deleteDepreciation, getAllDepreciation,
    getAllAssetCategories,
    getAssetCategoryById,
    getAllAssetTypes,
    getAssetTypeById,
    getAllStockTypes,
    getStockTypeById,
    generateAssetDetailsReport,
    generateStockDetailsReport,
    generateAssetCategoriesReport,
    generateStockTypesReport
  } = require('../controllers/sars');

const {
  createAccountingHead,
  updateAccountingHead,
  deleteAccountingHead,
  getAccountingHeads,
  getAccountingHeadById,
  getAllAccountingHeads,
  getLastFourVouchers,
  getLastFourTransactions,
  trialBalance,
  profitAndLoss,
  balanceSheet,
  ledgers,
} = require('../controllers/am')

const { isAdministrator, isSignedIn, createEndUsers } = require('../controllers/auth');

const router = require('express').Router()

router.param('adminId',getAdminById)
router.param('categoryId',getAssetCategoryById)
router.param('typeId',getAssetTypeById)
router.param('stockId',getStockTypeById)
router.param('degnId',getDesignationById)
router.param('accountHeadId',getAccountingHeadById)
router.param('approvingAuthority',getApprovingAuthorityById)

router.post('/admin/cr/designation',createDesignation)

const express = require('express');
const { generateEmployeeMasterReport, generatePayGenerationReport, generatePayBillPostingReport, generateRemittancesPostingReport } = require('../controllers/hrm');

// Designation Routes - Sys Admin Only
router.get("/admin/degn/:adminId", getDesignations);  // get Asset Category
router.post("/admin/degn/:adminId", createDesignation);  // Create Asset Category
router.put("/admin/degn/:degnId/:adminId", updateDesignation);  // Update Asset Category
router.delete("/admin/degn/:degnId/:adminId", removeDesignation);

// Asset Category Routes - Sys Admin Only
router.post("/sars/asset-categories", createAssetCategory);  // Create Asset Category
router.put("/sars/asset-categories/:categoryId", updateAssetCategory);  // Update Asset Category
router.delete("/sars/asset-categories/:categoryId", deleteAssetCategory);  // Delete Asset Category

router.get("/admin/asset-categories/:adminId", getAllAssetCategories);  // get Asset Category
router.post("/admin/asset-categories/:adminId", createAssetCategory);  // Create Asset Category
router.put("/admin/asset-categories/:categoryId/:adminId", updateAssetCategory);  // Update Asset Category
router.delete("/admin/asset-categories/:categoryId/:adminId", deleteAssetCategory);  // Delete Asset Category

// Asset Type Routes - Sys Admin Only
router.post("/sars/asset-types", createAssetType);  // Create Asset Type
router.put("/sars/asset-types/:typeId", updateAssetType);  // Update Asset Type
router.delete("/sars/asset-types/:typeId", deleteAssetType);  // Delete Asset Type

router.get("/admin/asset-types/:adminId", getAllAssetTypes);  // Create Asset Type
router.post("/admin/asset-types/:adminId", createAssetType);  // Create Asset Type
router.put("/admin/asset-types/:typeId/:adminId", updateAssetType);  // Update Asset Type
router.delete("/admin/asset-types/:typeId/:adminId", deleteAssetType);  // Delete Asset Type

// Depreciation Route - Sys Admin Only
// Import necessary controllers

// Create Depreciation (POST) - Admin only
router.post("/sars/depreciation", createDepreciation);

// Update Depreciation (PUT) - Admin only
router.put("/sars/depreciation/:depreciationId", updateDepreciation);

// Delete Depreciation (DELETE) - Admin only
router.delete("/sars/depreciation/:depreciationId", deleteDepreciation);

// Get All Depreciations (GET) - Admin only
router.get("/sars/depreciation", getAllDepreciation);


// Stock Type Routes - Sys Admin Only
router.post("/sars/stock-types", createStockType);  // Create Stock Type
router.put("/sars/stock-types/:typeId", updateStockType);  // Update Stock Type
router.delete("/sars/stock-types/:typeId", deleteStockType);  // Delete Stock Type

router.get("/admin/stock-types/:adminId", getAllStockTypes);  // Create Stock Type
router.post("/admin/stock-types/:adminId", createStockType);  // Create Stock Type
router.put("/admin/stock-types/:stockId/:adminId", updateStockType);  // Update Stock Type
router.delete("/admin/stock-types/:stockId/:adminId", deleteStockType);  // Delete Stock Type

// Accounting Head (System Admin Only)
router.post('/admin/accounting-head/create/:adminId', isSignedIn, createAccountingHead);      // Create
router.put('/admin/accounting-head/:accountHeadId/:adminId', isSignedIn, updateAccountingHead);         // Update
router.delete('/admin/accounting-head/:accountHeadId/:adminId', isSignedIn, deleteAccountingHead);     // Delete
router.post('/admin/accounting-head/:adminId', isSignedIn, getAllAccountingHeads);           // Get All
router.post('/admin/voucher/summary/:adminId', isSignedIn, getLastFourVouchers);           // Get All
router.post('/admin/transactions/summary/:adminId', isSignedIn, getLastFourTransactions);           // Get All

 // Stock Details Report
router.post("/admin/eu/:adminId", getEndUsers);
router.post("/admin/eu/cr/:adminId", createEndUsers);

router.post("/admin/totals/:adminId", isSignedIn, getTotals)

router.get("/admin/reports/asset-details", generateAssetDetailsReport);  // Asset Details Report
router.get("/admin/reports/stock-details", generateStockDetailsReport); 
router.get("/admin/reports/asset-categories", generateAssetCategoriesReport);  // Asset Categories Report
// router.get("/admin/reports/asset-details", generateAssetDetailsReport);  // Asset Details Report
router.get("/admin/reports/stock-types", generateStockTypesReport);  // Stock Types Report
// router.get("/admin/reports/stock-details", generateStockDetailsReport);  // Stock Details Report

router.get('/admin/reports/trial-balance', trialBalance);        // Trial Balance Report
router.get('/admin/reports/profit-loss', profitAndLoss);          // Profit and Loss Account
router.get('/admin/reports/balance-sheet', balanceSheet);         // Balance Sheet
router.get('/admin/reports/ledgers', ledgers);                    // Ledgers

router.get('/admin/reports/employee/:adminId', generateEmployeeMasterReport);  // Employee Report
router.get('/admin/reports/paygeneration/:adminId', generatePayGenerationReport);  // Pay Generation Report
router.get('/admin/reports/paybill/:adminId', generatePayBillPostingReport);  // Pay Bill Posting Report
router.get('/admin/reports/remittances/:adminId', generateRemittancesPostingReport);  // Remittances Report

router.post('/admin/approving-authority', createApprovingAuthority);  // Remittances Report
router.delete('/admin/approving-authority/:approvingAuthority', removeApprovingAuthority);  // Remittances Report


module.exports = router