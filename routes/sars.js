const express = require('express');
const router = express.Router();

// Controllers for agency users
const {
  getAssetDetailById,
  getStockDetailsById,
  generateAssetCategoriesReport,
  generateAssetDetailsReport,
  generateStockTypesReport,
  generateStockDetailsReport,
  // Agency Users: Create, Update, Delete Asset & Stock Details
  createAssetDetails,
  updateAssetDetails,
  deleteAssetDetails,
  createStockDetails,
  // updateStockDetail,
  // deleteStockDetail,
  getAllAssetDetails,
  getAllStockDetails,
  getAssetDetailsById,
  getAllAssetTypes,
  updateStockDetails,
  deleteStockDetails,
  getAllStockTypes,
} = require('../controllers/sars');

const { getEndUserById } = require('../controllers/admin');

// router.param('euId', getEndUserById)
router.param('assetId', getAssetDetailsById)
router.param('stockId', getStockDetailsById)
router.param('assetId', getAssetDetailsById)

// Asset Details Routes for Agency Users
router.get("/sars/asset-details", getAllAssetDetails);  // Get all Asset Details
// router.get("/sars/asset-details/:assetId", getAssetDetailById);  // Get Asset Detail by ID
router.post("/sars/asset-details", createAssetDetails);  // Create Asset Detail
router.put("/sars/asset-details/:assetId", updateAssetDetails);  // Update Asset Detail
router.delete("/sars/asset-details/:assetId", deleteAssetDetails);  // Delete Asset Detail

// Stock Details Routes for Agency Users
router.get("/sars/stock-details", getAllStockDetails);  // Get all Stock Details
// router.get("/sars/stock-details/:stockId", getStockDetailById);  // Get Stock Detail by ID
router.post("/sars/stock-details", createStockDetails);  // Create Stock Detail
router.put("/sars/stock-details/:stockId", updateStockDetails);  // Update Stock Detail
router.delete("/sars/stock-details/:stockId", deleteStockDetails);  // Delete Stock Detail

// Asset Type Routes for Agency Users
router.get("/sars/asset-type",getAllAssetTypes)

// Stock Type Routes for Agency Users
router.get("/sars/stock-type",getAllStockTypes)

// Reports Routes for Agency Users
router.get("/sars/reports/asset-categories", generateAssetCategoriesReport);  // Asset Categories Report
router.get("/sars/reports/asset-details", generateAssetDetailsReport);  // Asset Details Report
router.get("/sars/reports/stock-types", generateStockTypesReport);  // Stock Types Report
router.get("/sars/reports/stock-details", generateStockDetailsReport);  // Stock Details Report

module.exports = router;