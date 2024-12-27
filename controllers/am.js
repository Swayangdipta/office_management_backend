const AccountingHead = require("../models/accountingHead");
const Party = require('../models/partyMaster');
const Voucher = require('../models/voucher');
const BankTransaction = require('../models/bankTransaction');
const AssetDetails = require("../models/assetDetails");
const StockDetails = require("../models/stockDetails");
const MonthStatus = require('../models/monthStatus');
const YearStatus = require('../models/yearStatus');
const AuditLog = require('../models/auditLog');
const Depreciation = require('../models/depreciation');
const _ = require('lodash');


exports.getAccountingHeadById = async (req, res, next, id) => {
  try {
    const accountingHead = await AccountingHead.findById(id).populate("parent", "name");
    if (!accountingHead) {
      return res.status(404).json({ error: "Accounting Head not found" });
    }
    req.accountingHead = accountingHead; // Attach to request object
    next();
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error", data: error.message });
  }
};

exports.getPartyById = async (req, res, next, id) => {
    try {
      const party = await Party.findById(id);
      if (!party) {
        return res.status(404).json({ error: 'Party not found!' });
      }
      req.party = party;
      next();
    } catch (error) {
      return res.status(500).json({ error: 'Internal Server Error!', data: error });
    }
};

exports.getVoucherById = async (req, res, next, id) => {
    try {
      const voucher = await Voucher.findById(id).populate('payee').populate('transactions.accountHead');
      if (!voucher) {
        return res.status(404).json({ error: 'Voucher not found!' });
      }
      req.voucher = voucher;
      next();
    } catch (error) {
      return res.status(500).json({ error: 'Internal Server Error', data: error });
    }
};

// Fetch all accounting heads
exports.getAccountingHeads = async (req, res) => {
  try {
    const heads = await AccountingHead.find().populate("parent", "name");
    res.status(200).json({ success: true, data: heads });
  } catch (error) {
    res.status(500).json({ success: false, data: "Server error", error });
  }
};

// Create a new accounting head
exports.createAccountingHead = async (req, res) => {
  const { name, type, parent, asset, description, assets, stocks, code } = req.body;

  try {
    // Create a new accounting head
    const newHead = new AccountingHead({
      name,
      type,
      code,
      parent: parent || null,
      asset: asset || false,
      description,
      assets: asset ? assets : [],  // If asset sync is checked, assign assets
      stocks: asset ? stocks : [],  // If asset sync is checked, assign stocks
    });

    // Save the new accounting head
    const savedHead = await newHead.save();

    // If asset sync is checked, update assets and stocks to link them to this accounting head
    if (asset) {
      // Update assets to link them to the new accounting head
      await AssetDetails.updateMany(
        { _id: { $in: assets } },
        { $set: { accountHead: savedHead._id } } // Set the accountHead field
      );

      // Update stocks to link them to the new accounting head
      await StockDetails.updateMany(
        { _id: { $in: stocks } },
        { $set: { accountHead: savedHead._id } } // Set the accountHead field
      );
    }

    res.status(201).json({ success: true, data: savedHead });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};


// Update an Accounting Head
exports.updateAccountingHead = async (req, res) => {
  const { name, type, parent, asset, description, assets, stocks } = req.body;
  const accountingHead = req.accountingHead; // Assuming this is populated by middleware

  try {
    // Update fields only if they are provided
    if (name !== undefined) accountingHead.name = name;
    if (type !== undefined) accountingHead.type = type;
    if (parent !== undefined) accountingHead.parent = parent || null;
    if (asset !== undefined) accountingHead.asset = asset;
    if (description !== undefined) accountingHead.description = description;

    // Update assets and stocks if provided
    if (assets !== undefined) accountingHead.assets = Array.isArray(assets) ? assets : accountingHead.assets;
    if (stocks !== undefined) accountingHead.stocks = Array.isArray(stocks) ? stocks : accountingHead.stocks;

    const updatedHead = await accountingHead.save();
    res.status(200).json({ success: true, data: updatedHead });
  } catch (error) {
    console.error('Error updating accounting head:', error);
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

// Delete an accounting head
exports.deleteAccountingHead = async (req, res) => {
  const accountingHead = req.accountingHead;

  try {
    // If the accounting head is linked to assets or stocks, unlink them first
    if (accountingHead.asset) {
      // Unlink assets by setting their accountHead field to null
      await AssetDetails.updateMany(
        { _id: { $in: accountingHead.assets } },
        { $unset: { accountHead: "" } } // Remove the accountHead reference
      );

      // Unlink stocks by setting their accountHead field to null
      await StockDetails.updateMany(
        { _id: { $in: accountingHead.stocks } },
        { $unset: { accountHead: "" } } // Remove the accountHead reference
      );
    }

    // Delete the accounting head
    await accountingHead.deleteOne();

    res.status(200).json({ success: true, message: "Accounting head deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};


exports.getAllAccountingHeads = async (req, res) => {
  try {
    // Fetch all Accounting Heads
    
    const accountingHeads = await AccountingHead.find({type: req.body.type})
      .populate("parent") // For hierarchical structure
      .populate("assets") // Include linked assets
      .populate("stocks"); // Include linked stocks

    // Fetch asset and stock details from SARS
    const assetDetails = await AssetDetails.find().select("registrationId assetType purchaseValue");
    const stockDetails = await StockDetails.find().select("registrationId stockType purchaseValue");

    return res.status(200).json({
      success: "Accounting Heads fetched successfully",
      data: {
        accountingHeads,
        assetsFromSARS: assetDetails,
        stocksFromSARS: stockDetails,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error", message: error.message });
  }
};

exports.getAllAccountingHeadSub = async (req, res) => {
  try {
    // Fetch all Accounting Heads
    
    const accountingHeads = await AccountingHead.find({type: req.body.type, parent: req.body.parent})
      .populate("parent") // For hierarchical structure
      .populate("assets") // Include linked assets
      .populate("stocks"); // Include linked stocks

    // Fetch asset and stock details from SARS
    const assetDetails = await AssetDetails.find().select("registrationId assetType purchaseValue");
    const stockDetails = await StockDetails.find().select("registrationId stockType purchaseValue");

    return res.status(200).json({
      success: "Accounting Heads fetched successfully",
      data: {
        accountingHeads,
        assetsFromSARS: assetDetails,
        stocksFromSARS: stockDetails,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error", message: error.message });
  }
};

// Party Master

// Create a new party
exports.createParty = async (req, res) => {
  try {
    const party = new Party(req.body);
    const savedParty = await party.save();
    res.status(201).json({ success: true, data: savedParty });
  } catch (error) {
    res.status(400).json({ success: false, data: 'Failed to create Party', error });
  }
};

// Get a single party
exports.getParty = (req, res) => {
  return res.status(200).json({ success: true, data: req.party });
};

// Update a party
exports.updateParty = async (req, res) => {
  try {
    const party = req.party;
    _.extend(party, req.body);

    const updatedParty = await party.save();
    res.status(200).json({ success: true, data: updatedParty });
  } catch (error) {
    res.status(400).json({ success: false, data: 'Failed to update Party', error });
  }
};

// Delete a party
exports.deleteParty = async (req, res) => {
  try {
    const party = req.party;
    await party.deleteOne();
    res.status(200).json({ success: true, data: 'Party deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, data: 'Failed to delete Party', error });
  }
};

// Get all parties
exports.getAllParties = async (req, res) => {
  try {
    const parties = await Party.find({});
    res.status(200).json({ success: true, data: parties });
  } catch (error) {
    res.status(500).json({ success: false, data: 'Failed to fetch Parties', error });
  }
};

// Voucher

// Middleware to fetch voucher by ID

// Create a new voucher
exports.createVoucher = async (req, res) => {
  try {
    const datee = new Date();
    console.log(req.body);
    
    // Shortened Voucher No
    const pad = (num) => String(num).padStart(2, '0');
    const voucherNo = `CP${datee.getFullYear().toString().slice(-2)}${pad(datee.getMonth() + 1)}${pad(datee.getDate())}${datee.getMilliseconds()}`;

    const voucherId = `V-${Date.now()}`;

    // Check and set subMajorHead to null if not provided or empty in each transaction
    req.body.transactions = req.body.transactions.map(transaction => {
      if (!transaction.subMajorHead || transaction.subMajorHead === '') {
        transaction.subMajorHead = null;
      }
      return transaction;
    });

    const voucher = new Voucher({ ...req.body, voucherId, voucherNo });

    // Validate transactions
    if (!Array.isArray(voucher.transactions)) {
      return res.status(400).json({ error: 'Transactions must be an array' });
    }
    
    // Calculate debit and credit totals
    const debitTotal = voucher.transactions
      .filter((t) => t.debit > 0)
      .reduce((sum, t) => sum + t.debit, 0);

    const creditTotal = voucher.transactions
      .filter((t) => t.credit > 0)
      .reduce((sum, t) => sum + t.credit, 0);

    voucher.isBalanced = debitTotal === creditTotal;

    if (!voucher.isBalanced) {
      return res.status(400).json({ error: 'Debit and Credit amounts must balance before saving.' });
    }

    // Save voucher
    const savedVoucher = await voucher.save();
    res.status(201).json({ success: true, data: savedVoucher });
  } catch (error) {
    console.error('Error creating voucher:', error); // Log error for debugging
    res.status(500).json({ success: false, message: 'Error creating voucher', error: error.message });
  }
};


// Get a single voucher
exports.getVoucher = (req, res) => {
  return res.status(200).json({ success: true, data: req.voucher });
};

// Update a voucher
exports.updateVoucher = async (req, res) => {
  try {
    const voucher = req.voucher;
    _.extend(voucher, req.body);

    // Recalculate balance
    const debitTotal = voucher.transactions
      .filter((t) => t.type === 'Debit')
      .reduce((sum, t) => sum + t.amount, 0);

    const creditTotal = voucher.transactions
      .filter((t) => t.type === 'Credit')
      .reduce((sum, t) => sum + t.amount, 0);

    voucher.isBalanced = debitTotal === creditTotal;

    if (!voucher.isBalanced) {
      return res.status(400).json({ error: 'Debit and Credit amounts must balance before updating.' });
    }

    const updatedVoucher = await voucher.save();
    res.status(200).json({ success: true, data: updatedVoucher });
  } catch (error) {
    res.status(400).json({ success: false, data: 'Failed to update voucher', error });
  }
};

// Delete a voucher
exports.deleteVoucher = async (req, res) => {
  try {
    const voucher = req.voucher;
    await voucher.deleteOne();
    res.status(200).json({ success: true, data: 'Voucher deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, data: 'Failed to delete voucher', error });
  }
};

// Get all vouchers
exports.getAllVouchers = async (req, res) => {
  try {
    const vouchers = await Voucher.find({}).populate('payee').populate('transactions.accountHead').populate('transactions.subMajorHead').populate('approvingAuthority');
    res.status(200).json({ success: true, data: vouchers });
  } catch (error) {
    res.status(500).json({ success: false, data: 'Failed to fetch vouchers', error });
  }
};

exports.getLastFourVouchers = async (req, res) => {
  try {
    const vouchers = await Voucher.find({})
      .sort({ entryDate: -1 })
      .limit(4)
      .populate('payee')
      .populate('transactions.accountHead');

    res.status(200).json({ success: true, data: vouchers });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch last four vouchers', error });
  }
};
// Bank Transactions

// Create a new bank transaction
exports.createBankTransaction = async (req, res) => {
  try {
    const { date, description, debit, credit, voucher } = req.body;

    // Create a new BankTransaction instance
    const bankTransaction = new BankTransaction({
      date,
      description,
      debit,
      credit,
      voucher,
    });

    // Save the transaction to the database
    const savedTransaction = await bankTransaction.save();

    // Send a success response
    res.status(201).json({ success: true, data: savedTransaction });
  } catch (error) {
    // Handle any errors
    res.status(400).json({ success: false, data: 'Failed to create bank transaction', error });
  }
};

// Generate Bank Statements
exports.generateBankStatement = async (req, res) => {
  try {
    const transactions = await BankTransaction.find({})
      .populate({
        path: 'voucher',
        select: 'narration voucherType voucherId'
      })
      .sort({ date: 1 });

    console.log(transactions);
    
    res.status(200).json({ success: true, data: transactions });
  } catch (error) {
    res.status(500).json({ success: false, data: 'Failed to fetch bank statements', error });
  }
};

// Reconcile a Transaction
exports.reconcileTransaction = async (req, res) => {
  const { transactionId } = req.params;
  try {
    const transaction = await BankTransaction.findById(transactionId);
    if (!transaction) {
      return res.status(404).json({ success: false, data: 'Transaction not found' });
    }

    transaction.reconciled = true;
    await transaction.save();

    res.status(200).json({ success: true, message: 'Transaction reconciled successfully', data: transaction });
  } catch (error) {
    res.status(500).json({ success: false, data: 'Failed to reconcile transaction', error });
  }
};

// Get All Reconciled Transactions
exports.getReconciledTransactions = async (req, res) => {
  try {
    const reconciledTransactions = await BankTransaction.find({ reconciled: true }).sort({ date: 1 });

    res.status(200).json({ success: true, data: reconciledTransactions });
  } catch (error) {
    res.status(500).json({ success: false, data: 'Failed to fetch reconciled transactions', error });
  }
};

exports.getLastFourTransactions = async (req, res) => {
  try {
    const transactions = await BankTransaction.find({})
      .populate('voucher', 'narration voucherType')
      .sort({ date: -1 })
      .limit(4);

    res.status(200).json({ success: true, data: transactions });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch last four bank transactions', error });
  }
};

// Process

// Month-End Processing

// Close Month
exports.closeMonth = async (req, res) => {
  try {
    // Check for pending reconciliation
    const unreconciledTransactions = await BankTransaction.find({ reconciled: false });
    if (unreconciledTransactions.length > 0) {
      return res.status(400).json({
        success: false,
        data: 'Cannot close month. There are unreconciled bank transactions.',
      });
    }

    // Check for unapproved vouchers
    const unapprovedVouchers = await Voucher.find({ approved: false });
    if (unapprovedVouchers.length > 0) {
      return res.status(400).json({
        success: false,
        data: 'Cannot close month. There are unapproved vouchers.',
      });
    }

    // Mark the month as closed
    const currentDate = new Date();
    await MonthStatus.updateOne(
      { year: currentDate.getFullYear(), month: currentDate.getMonth() + 1 },
      { $set: { closed: true } }
    );

    // Create an audit log for closing the month
    const auditLog = new AuditLog({
      action: 'Close Month',
      details: 'Month closed successfully.',
    });
    await auditLog.save();

    res.status(200).json({
      success: true,
      data: 'Month closed successfully.',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      data: 'Failed to close month.',
      error: error.message,
    });
  }
};

// Close Year
exports.closeYear = async (req, res) => {
  try {
    // Check for pending reconciliation
    const unreconciledTransactions = await BankTransaction.find({ reconciled: false });
    if (unreconciledTransactions.length > 0) {
      return res.status(400).json({
        success: false,
        data: 'Cannot close year. There are unreconciled bank transactions.',
      });
    }

    // Check for unapproved vouchers
    const unapprovedVouchers = await Voucher.find({ approved: false });
    if (unapprovedVouchers.length > 0) {
      return res.status(400).json({
        success: false,
        data: 'Cannot close year. There are unapproved vouchers.',
      });
    }

    // Check for completed year-end transactions (e.g., Depreciation)
    const depreciationTransactions = await Voucher.find({ voucherType: 'Depreciation' });
    if (depreciationTransactions.length === 0) {
      return res.status(400).json({
        success: false,
        data: 'Cannot close year. Depreciation transactions are incomplete.',
      });
    }

    // Mark the year as closed
    const currentDate = new Date();
    await YearStatus.updateOne(
      { year: currentDate.getFullYear() },
      { $set: { closed: true } }
    );

    // Create an audit log for closing the year
    const auditLog = new AuditLog({
      action: 'Close Year',
      details: 'Year closed successfully.',
    });
    await auditLog.save();

    res.status(200).json({
      success: true,
      data: 'Year closed successfully.',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      data: 'Failed to close year.',
      error: error.message,
    });
  }
};


// Trial Balance
// Trial Balance
exports.trialBalance = async (req, res) => {
  try {
    const { startDate, endDate } = req.body;
    
    const parsedStartDate = new Date(startDate);
    const parsedEndDate = new Date(endDate);

    if (isNaN(parsedStartDate.getTime()) || isNaN(parsedEndDate.getTime())) {
      throw new Error('Invalid date format.');
    }

    const filter = {
      date: { $gte: parsedStartDate, $lte: parsedEndDate },
    };

    const vouchers = await Voucher.find({
      entryDate: filter.date,
    }).populate('transactions.accountHead');

    const bankTransactions = await BankTransaction.find(filter).populate('voucher').populate('voucher.transactions.accountHead');

    // Map account balances
    const accountBalances = {};

    // Process voucher transactions
    vouchers.forEach((voucher) => {
      voucher.transactions.forEach((tx) => {
        const { accountHead, debit, credit } = tx;
        if (!accountBalances[accountHead?.name]) {
          accountBalances[accountHead?.name] = { debit: 0, credit: 0 };
        }
        if (debit > 0 || tx.type === 'Debit') {
          accountBalances[accountHead.name].debit += debit || tx.amount || 0;
        } else if (credit > 0 || tx.type === 'Credit') {
          accountBalances[accountHead.name].credit += credit || tx.amount || 0; 
        }
      });
    });


    // Process bank transactions
    bankTransactions.forEach((transaction) => {
      const { voucher, debit, credit } = transaction;
      if (!accountBalances[voucher.accountHead?.name]) {
        accountBalances[voucher.accountHead?.name] = { debit: 0, credit: 0 };
      }
      accountBalances[voucher.accountHead?.name].debit += debit;
      accountBalances[voucher.accountHead?.name].credit += credit;
    });


    // Prepare trial balance array
    const trialBalance = Object.entries(accountBalances).map(([accountName, balances]) => ({
      accountName,
      debit: balances.debit,
      credit: balances.credit,
    }));
    // Calculate totals
    const totalDebit = trialBalance.reduce((sum, acc) => sum + acc.debit, 0);
    const totalCredit = trialBalance.reduce((sum, acc) => sum + acc.credit, 0);
    
    res.status(200).json({
      success: true,
      data: {
        trialBalance,
        totals: { totalDebit, totalCredit },
        isBalanced: totalDebit === totalCredit,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error generating Trial Balance', error });
  }
};

exports.profitAndLoss = async (req, res) => {
  try {
    const { startDate, endDate } = req.body;

    // Validate the input dates
    if (!startDate || !endDate) {
      return res.status(400).json({ success: false, message: 'Start and end dates are required.' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start) || isNaN(end)) {
      return res.status(400).json({ success: false, message: 'Invalid date format.' });
    }

    // Check if the specified period is open
    // const monthStatus = await MonthStatus.findOne({
    //   year: start.getFullYear(),
    //   month: start.getMonth() + 1,
    // });
    // const yearStatus = await YearStatus.findOne({ year: start.getFullYear() });

    // if (monthStatus?.closed || yearStatus?.closed) {
    //   return res.status(400).json({
    //     success: false,
    //     message: 'The specified period is closed. Unable to generate Profit and Loss statement.',
    //   });
    // }

    // Fetch vouchers within the date range
    const vouchers = await Voucher.find({
      entryDate: { $gte: start, $lte: end },
    });

    let revenues = {}; // Dynamic object for all revenue entries
    let expenses = {}; // Dynamic object for all expense entries

    vouchers.forEach((voucher) => {
      voucher.transactions.forEach((transaction) => {
        const narration = voucher.narration.trim().toLowerCase(); // Normalize narration for consistency

        if (transaction.credit && transaction.credit > 0) {
          // Dynamically group revenues
          const key = narration || 'Revenue'; // Default key if narration is empty
          revenues[key] = (revenues[key] || 0) + transaction.credit;
        } else if (transaction.debit && transaction.debit > 0) {
          // Dynamically group expenses
          const key = narration || 'Expense'; // Default key if narration is empty
          expenses[key] = (expenses[key] || 0) + transaction.debit;
        }
      });
    });

    // Calculate totals for revenue and expenses
    const totalRevenue = Object.values(revenues).reduce((sum, val) => sum + val, 0);
    const totalExpenses = Object.values(expenses).reduce((sum, val) => sum + val, 0);

    // Fetch all assets for depreciation
    const assets = await AssetDetails.find();
    const depreciationEntries = await Depreciation.find();
    console.log(depreciationEntries);
    let totalDepreciation = 0;
    depreciationEntries.forEach((entry) => {
      assets.forEach((asset) => {
        if (asset.assetType.toString() === entry.category.toString()) {
          totalDepreciation += (asset.purchaseValue * entry.depreciationRate) / 100;
        }
      });
    });

    // Fetch stock details
    const openingStock = await StockDetails.find({
      purchaseDate: { $lt: start }, // Stock purchased before the start date
    });

    const closingStock = await StockDetails.find({
      purchaseDate: { $lte: end }, // Stock purchased until the end date
    });

    // Calculate stock values
    const totalOpeningStockValue = openingStock.reduce((sum, stock) => sum + stock.purchaseValue, 0);
    const totalClosingStockValue = closingStock.reduce((sum, stock) => sum + stock.purchaseValue, 0);

    // Calculate Gross Profit/Loss
    const grossProfitOrLoss = totalRevenue - totalExpenses - totalOpeningStockValue + totalClosingStockValue;

    // Final Net Profit/Loss
    const netProfitOrLoss = grossProfitOrLoss - totalDepreciation;

    // Send response with dynamic breakdown
    res.status(200).json({
      success: true,
      data: {
        revenues,
        expenses,
        totalRevenue,
        totalExpenses,
        openingStock: totalOpeningStockValue,
        closingStock: totalClosingStockValue,
        depreciation: totalDepreciation,
        grossProfitOrLoss,
        netProfitOrLoss,
      },
    });
  } catch (error) {
    console.error('Error generating Profit and Loss account:', error);
    res.status(500).json({ success: false, message: 'Error generating Profit and Loss account', error });
  }
};


// Balance Sheet
exports.balanceSheet = async (req, res) => {
  try {
    const { startDate, endDate } = req.body;

    // Validate the input dates
    if (!startDate || !endDate) {
      return res.status(400).json({ success: false, message: 'Start and end dates are required.' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start) || isNaN(end)) {
      return res.status(400).json({ success: false, message: 'Invalid date format.' });
    }

    // Fetch transactions within the date range
    const transactions = await BankTransaction.find({
      date: { $gte: start, $lte: end },
    });

    // Dynamic structure for the balance sheet
    const balanceSheet = {
      liabilities: {},
      assets: {},
      totals: { totalLiabilities: 0, totalAssets: 0 },
    };

    // Categorize transactions dynamically
    transactions.forEach((transaction) => {
      const { debit, credit, description } = transaction;

      if (credit > 0) {
        // Liability category (credit transactions)
        if (!balanceSheet.liabilities[description]) {
          balanceSheet.liabilities[description] = 0;
        }
        balanceSheet.liabilities[description] += credit;
      }

      if (debit > 0) {
        // Asset category (debit transactions)
        if (!balanceSheet.assets[description]) {
          balanceSheet.assets[description] = 0;
        }
        balanceSheet.assets[description] += debit;
      }
    });

    // Calculate totals dynamically
    const totalLiabilities = Object.values(balanceSheet.liabilities).reduce((sum, value) => sum + value, 0);
    const totalAssets = Object.values(balanceSheet.assets).reduce((sum, value) => sum + value, 0);

    balanceSheet.totals.totalLiabilities = totalLiabilities;
    balanceSheet.totals.totalAssets = totalAssets;

    res.status(200).json({
      success: true,
      data: balanceSheet,
    });
  } catch (error) {
    console.error('Error generating Balance Sheet:', error);
    res.status(500).json({ success: false, message: 'Error generating Balance Sheet', error });
  }
};

// Ledgers
exports.ledgers = async (req, res) => {
  try {
    const { startDate, endDate } = req.body;

    // Validate the input dates
    if (!startDate || !endDate) {
      return res.status(400).json({ success: false, message: 'Start and end dates are required.' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start) || isNaN(end)) {
      return res.status(400).json({ success: false, message: 'Invalid date format.' });
    }

    // Fetch vouchers and bank transactions within the date range
    const vouchers = await Voucher.find({
      entryDate: { $gte: start, $lte: end },
    });
    const bankTransactions = await BankTransaction.find({
      date: { $gte: start, $lte: end },
    });

    const ledgers = {
      revenue: [],
      expenses: [],
      assets: [],
      liabilities: [],
    };

    // Process vouchers
    vouchers.forEach((voucher) => {
      voucher.transactions.forEach((transaction) => {
        if (transaction.type === 'Credit' && voucher.narration.toLowerCase().includes('Revenue'.toLowerCase())) {
          ledgers.revenue.push({
            date: voucher.entryDate,
            description: voucher.narration,
            amount: transaction.amount,
          });
        } else if (transaction.type === 'Debit' && voucher.narration.toLowerCase().includes('Expense'.toLowerCase())) {
          ledgers.expenses.push({
            date: voucher.entryDate,
            description: voucher.narration,
            amount: transaction.amount,
          });
        }
      });
    });

    // Process bank transactions
    bankTransactions.forEach((transaction) => {
      if (transaction.debit > 0) {
        ledgers.assets.push({
          date: transaction.date,
          description: transaction.description,
          amount: transaction.debit,
        });
      } else if (transaction.credit > 0) {
        ledgers.liabilities.push({
          date: transaction.date,
          description: transaction.description,
          amount: transaction.credit,
        });
      }
    });

    res.status(200).json({
      success: true,
      data: ledgers,
    });
  } catch (error) {
    console.error('Error generating Ledgers:', error);
    res.status(500).json({ success: false, message: 'Error generating Ledgers', error });
  }
};