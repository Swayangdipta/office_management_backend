const { getAdminById, createDesignation } = require('../controllers/admin')
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
    createDepreciation, updateDepreciation, deleteDepreciation, getAllDepreciation
  } = require('../controllers/sars');

const router = require('express').Router()

router.param('adminId',getAdminById)

router.post('/admin/cr/designation',createDesignation)

const express = require('express');

// Asset Category Routes
router.post("/sars/asset-categories", createAssetCategory);  // Create Asset Category
router.put("/sars/asset-categories/:categoryId", updateAssetCategory);  // Update Asset Category
router.delete("/sars/asset-categories/:categoryId", deleteAssetCategory);  // Delete Asset Category

// Asset Type Routes
router.post("/sars/asset-types", createAssetType);  // Create Asset Type
router.put("/sars/asset-types/:typeId", updateAssetType);  // Update Asset Type
router.delete("/sars/asset-types/:typeId", deleteAssetType);  // Delete Asset Type

// Depreciation Route
// Import necessary controllers

// Create Depreciation (POST) - Admin only
router.post("/sars/depreciation", createDepreciation);

// Update Depreciation (PUT) - Admin only
router.put("/sars/depreciation/:depreciationId", updateDepreciation);

// Delete Depreciation (DELETE) - Admin only
router.delete("/sars/depreciation/:depreciationId", deleteDepreciation);

// Get All Depreciations (GET) - Admin only
router.get("/sars/depreciation", getAllDepreciation);


// Stock Type Routes
router.post("/sars/stock-types", createStockType);  // Create Stock Type
router.put("/sars/stock-types/:typeId", updateStockType);  // Update Stock Type
router.delete("/sars/stock-types/:typeId", deleteStockType);  // Delete Stock Type


module.exports = router