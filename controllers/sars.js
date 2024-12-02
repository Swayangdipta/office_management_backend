const AssetCategory = require("../models/assetCategory");
const AssetDetails = require("../models/assetDetails");
const AssetType = require("../models/assetType");
const Depreciation = require("../models/depreciation");
const StockType = require('../models/stockType');
const StockDetails = require('../models/stockDetails.js');

// Get Asset Category by ID
exports.getAssetCategoryById = async (req, res, next, id) => {
  try {
    const assetCategory = await AssetCategory.findById(id);
    if (!assetCategory) {
      return res.status(404).json({ error: "Asset Category not found!" });
    }
    req.assetCategory = assetCategory;
    next();
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error!", message: error });
  }
};

// Get Asset Details by ID
exports.getAssetDetailsById = async (req, res, next, id) => {
    try {
      const assetDetails = await AssetDetails.findById(id);
      if (!assetDetails) {
        return res.status(404).json({ error: "Asset Details not found!" });
      }
      req.assetDetails = assetDetails;
      next();
    } catch (error) {
      return res.status(500).json({ error: "Internal Server Error!", message: error });
    }
};

// 
exports.getAssetTypeById = async (req, res, next, id) => {
try {
    const assetType = await AssetType.findById(id).populate("category");

    if (!assetType) {
    return res.status(404).json({ error: "Asset Type not found" });
    }

    req.assetType = assetType;
    next();
} catch (error) {
    return res.status(500).json({ error: "Internal Server Error", message: error });
}
};

// 
exports.getDepreciationById = async (req, res, next, id) => {
    try {
      const depreciation = await Depreciation.findById(id).populate("category");
  
      if (!depreciation) {
        return res.status(404).json({ error: "Depreciation data not found" });
      }
  
      req.depreciation = depreciation;
      next();
    } catch (error) {
      return res.status(500).json({ error: "Internal Server Error", message: error });
    }
};

// Get Stock Type by ID
exports.getStockTypeById = async (req, res, next, id) => {
    try {
      const stockType = await StockType.findById(id);
  
      if (!stockType) {
        return res.status(404).json({ error: "Stock type not found" });
      }
  
      req.stockType = stockType;
      next();
    } catch (error) {
      return res.status(500).json({ error: 'Internal Server Error', message: error });
    }
};

// Get Stock Details by ID
exports.getStockDetailsById = async (req, res, next, id) => {
    try {
      const stockDetails = await StockDetails.findById(id).populate('stockType');
  
      if (!stockDetails) {
        return res.status(404).json({ error: "Stock details not found" });
      }
  
      req.stockDetails = stockDetails;
      next();
    } catch (error) {
      return res.status(500).json({ error: 'Internal Server Error', message: error });
    }
};

/* ===========================================================================================*/

// Create Asset Category
exports.createAssetCategory = async (req, res) => {
  try {
    const { name, assetTypes, depreciationRate } = req.body;
    if (!name) {
      return res.status(400).json({ error: "Name is required!" });
    }

    const assetCategory = new AssetCategory({ name, assetTypes, depreciationRate });
    const savedCategory = await assetCategory.save();

    return res.status(201).json({ success: "Asset Category created successfully!", data: savedCategory });
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error!", message: error });
  }
};

// Update Asset Category
exports.updateAssetCategory = async (req, res) => {
  try {
    const assetCategory = req.assetCategory;
    const { name, assetTypes, depreciationRate } = req.body;

    if (name) assetCategory.name = name;
    if (assetTypes) assetCategory.assetTypes = assetTypes;
    if (depreciationRate !== undefined) assetCategory.depreciationRate = depreciationRate;

    const updatedCategory = await assetCategory.save();
    return res.status(200).json({ success: "Asset Category updated successfully!", data: updatedCategory });
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error!", message: error });
  }
};

// Delete Asset Category
exports.deleteAssetCategory = async (req, res) => {
  try {
    const assetCategory = req.assetCategory;
    await assetCategory.deleteOne();
    return res.status(200).json({ success: "Asset Category deleted successfully!" });
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error!", message: error });
  }
};

// Get All Asset Categories
exports.getAllAssetCategories = async (req, res) => {
  try {
    const assetCategories = await AssetCategory.find();
    return res.status(200).json({ success: "Asset Categories fetched successfully!", data: assetCategories });
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error!", message: error });
  }
};

/* ===========================================================================================*/

// Create Asset Details
exports.createAssetDetails = async (req, res) => {
  try {
    const { assetType, registrationId, purchaseDate, model, purchaseValue } = req.body;

    if (!assetType || !registrationId || !purchaseDate || !purchaseValue) {
      return res.status(400).json({ error: "All required fields must be filled!" });
    }

    const assetDetails = new AssetDetails({ assetType, registrationId, purchaseDate, model, purchaseValue });
    const savedDetails = await assetDetails.save();

    return res.status(201).json({ success: "Asset Details created successfully!", data: savedDetails });
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error!", message: error });
  }
};

// Update Asset Details
exports.updateAssetDetails = async (req, res) => {
  try {
    const assetDetails = req.assetDetails;
    const { assetType, registrationId, purchaseDate, model, purchaseValue } = req.body;

    if (assetType) assetDetails.assetType = assetType;
    if (registrationId) assetDetails.registrationId = registrationId;
    if (purchaseDate) assetDetails.purchaseDate = purchaseDate;
    if (model) assetDetails.model = model;
    if (purchaseValue !== undefined) assetDetails.purchaseValue = purchaseValue;

    const updatedDetails = await assetDetails.save();
    return res.status(200).json({ success: "Asset Details updated successfully!", data: updatedDetails });
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error!", message: error });
  }
};

// Delete Asset Details
exports.deleteAssetDetails = async (req, res) => {
    try {
      const assetDetails = req.assetDetails;
      await assetDetails.deleteOne(); // Use deleteOne() instead of deleteOne()
      return res.status(200).json({ success: "Asset Details deleted successfully!" });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: "Internal Server Error!", message: error });
    }
  };
  

// Get All Asset Details
exports.getAllAssetDetails = async (req, res) => {
  try {
    const assetDetails = await AssetDetails.find().populate('assetType');
    return res.status(200).json({ success: "Asset Details fetched successfully!", data: assetDetails });
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error!", message: error });
  }
};

/* ===========================================================================================*/

// Asset Type
exports.createAssetType = async (req, res) => {
    try {
      const { name, category } = req.body;
  
      if (!name || !category) {
        return res.status(400).json({ error: "Name and category are required" });
      }
  
      const newAssetType = new AssetType({ name, category });
      const savedAssetType = await newAssetType.save();
  
      return res
        .status(201)
        .json({ success: "Asset Type created successfully", data: savedAssetType });
    } catch (error) {
      return res.status(500).json({ error: "Internal Server Error", message: error });
    }
};

exports.updateAssetType = async (req, res) => {
    try {
        const assetType = req.assetType;
        const { name, category } = req.body;

        if (name) assetType.name = name;
        if (category) assetType.category = category;

        const updatedAssetType = await assetType.save();

        return res
        .status(200)
        .json({ success: "Asset Type updated successfully", data: updatedAssetType });
    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error", message: error });
    }
};

exports.deleteAssetType = async (req, res) => {
    try {
        const assetType = req.assetType;

        const deletedAssetType = await assetType.deleteOne();

        return res
        .status(200)
        .json({ success: "Asset Type deleted successfully", data: deletedAssetType });
    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error", message: error });
    }
};

exports.getAllAssetTypes = async (req, res) => {
    try {
        const assetTypes = await AssetType.find().populate("category");

        return res.status(200).json({ success: "Asset Types fetched successfully", data: assetTypes });
    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error", message: error });
    }
};

/* ===========================================================================================*/

// Depreciation
exports.createDepreciation = async (req, res) => {
    try {
      const { category, depreciationRate } = req.body;
  
      if (!category || depreciationRate === undefined) {
        return res.status(400).json({ error: "Category and depreciation rate are required" });
      }
  
      if (depreciationRate < 0) {
        return res.status(400).json({ error: "Depreciation rate must be non-negative" });
      }
  
      const newDepreciation = new Depreciation({ category, depreciationRate });
      const savedDepreciation = await newDepreciation.save();
  
      return res
        .status(201)
        .json({ success: "Depreciation tagged successfully", data: savedDepreciation });
    } catch (error) {
      return res.status(500).json({ error: "Internal Server Error", message: error });
    }
};

exports.updateDepreciation = async (req, res) => {
    try {
      const depreciation = req.depreciation;
      const { depreciationRate } = req.body;
  
      if (depreciationRate !== undefined) {
        if (depreciationRate < 0) {
          return res.status(400).json({ error: "Depreciation rate must be non-negative" });
        }
        depreciation.depreciationRate = depreciationRate;
      }
  
      const updatedDepreciation = await depreciation.save();
  
      return res
        .status(200)
        .json({ success: "Depreciation updated successfully", data: updatedDepreciation });
    } catch (error) {
      return res.status(500).json({ error: "Internal Server Error", message: error });
    }
};
  
exports.deleteDepreciation = async (req, res) => {
    try {
      const depreciation = req.depreciation;
  
      const deletedDepreciation = await depreciation.deleteOne();
  
      return res
        .status(200)
        .json({ success: "Depreciation data deleted successfully", data: deletedDepreciation });
    } catch (error) {
      return res.status(500).json({ error: "Internal Server Error", message: error });
    }
};

exports.getAllDepreciation = async (req, res) => {
    try {
      const depreciations = await Depreciation.find().populate("category");
  
      return res.status(200).json({ success: "Depreciation data fetched successfully", data: depreciations });
    } catch (error) {
      return res.status(500).json({ error: "Internal Server Error", message: error });
    }
};

/* ===========================================================================================*/

// Create Stock Type (Admin Only)
exports.createStockType = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Stock type name is required" });
    }

    const newStockType = new StockType({ name, description });
    const savedStockType = await newStockType.save();

    return res.status(201).json({
      success: 'Stock type created successfully',
      data: savedStockType
    });
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error', message: error });
  }
};

// Update Stock Type (Admin Only)
exports.updateStockType = async (req, res) => {
  try {
    const stockType = req.stockType;
    const { name, description } = req.body;

    if (name) stockType.name = name;
    if (description) stockType.description = description;

    const updatedStockType = await stockType.save();

    return res.status(200).json({
      success: 'Stock type updated successfully',
      data: updatedStockType
    });
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error', message: error });
  }
};

// Delete Stock Type (Admin Only)
exports.deleteStockType = async (req, res) => {
  try {
    const stockType = req.stockType;

    const deletedStockType = await stockType.deleteOne();

    return res.status(200).json({
      success: 'Stock type deleted successfully',
      data: deletedStockType
    });
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error', message: error });
  }
};

// Get All Stock Types
exports.getAllStockTypes = async (req, res) => {
  try {
    const stockTypes = await StockType.find();

    return res.status(200).json({
      success: 'Stock types fetched successfully',
      data: stockTypes
    });
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error', message: error });
  }
};

/* ===========================================================================================*/

// Create Stock Details (Agency Users Only)
exports.createStockDetails = async (req, res) => {
  try {
    const { stockType, registrationId, model, purchaseDate, purchaseValue } = req.body;

    if (!stockType || !registrationId || !model || !purchaseDate || !purchaseValue) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const newStockDetails = new StockDetails({ stockType, registrationId, model, purchaseDate, purchaseValue });
    const savedStockDetails = await newStockDetails.save();

    return res.status(201).json({
      success: 'Stock details created successfully',
      data: savedStockDetails
    });
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error', message: error });
  }
};

exports.updateStockDetails = async (req, res) => {
    try {
      const assetDetails = req.stockDetails;
      const { stockType, registrationId, purchaseDate, model, purchaseValue } = req.body;
  
      if (stockType) assetDetails.assetType = stockType;
      if (registrationId) assetDetails.registrationId = registrationId;
      if (purchaseDate) assetDetails.purchaseDate = purchaseDate;
      if (model) assetDetails.model = model;
      if (purchaseValue !== undefined) assetDetails.purchaseValue = purchaseValue;
  
      const updatedDetails = await assetDetails.save();
      return res.status(200).json({ success: "Stock Details updated successfully!", data: updatedDetails });
    } catch (error) {
      return res.status(500).json({ error: "Internal Server Error!", message: error });
    }
  };
  
  // Delete Asset Details
  exports.deleteStockDetails = async (req, res) => {
      try {
        const assetDetails = req.stockDetails;
        await assetDetails.deleteOne(); // Use deleteOne() instead of remove()
        return res.status(200).json({ success: "Asset Details deleted successfully!" });
      } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Internal Server Error!", message: error });
      }
    };
    

// Get All Stock Details
exports.getAllStockDetails = async (req, res) => {
  try {
    const stockDetails = await StockDetails.find().populate('stockType');

    return res.status(200).json({
      success: 'Stock details fetched successfully',
      data: stockDetails
    });
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error', message: error });
  }
};

/* ===========================================================================================*/

// Report for Asset Categories
exports.generateAssetCategoriesReport = async (req, res) => {
  try {
    const assetCategories = await AssetCategory.find();
    return res.status(200).json({
      success: 'Asset categories fetched successfully',
      data: assetCategories,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error', message: error });
  }
};

// Report for Asset Details
exports.generateAssetDetailsReport = async (req, res) => {
  try {
    const assetDetails = await AssetDetails.find().populate('assetType');
    return res.status(200).json({
      success: 'Asset details fetched successfully',
      data: assetDetails,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error', message: error });
  }
};

// Report for Stock Types
exports.generateStockTypesReport = async (req, res) => {
  try {
    const stockTypes = await StockType.find();
    return res.status(200).json({
      success: 'Stock types fetched successfully',
      data: stockTypes,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error', message: error });
  }
};

// Report for Stock Details
exports.generateStockDetailsReport = async (req, res) => {
  try {
    const stockDetails = await StockDetails.find().populate('stockType');
    return res.status(200).json({
      success: 'Stock details fetched successfully',
      data: stockDetails,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error', message: error });
  }
};
