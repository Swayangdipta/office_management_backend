const AccountingHead = require("../models/accountingHead");
const Party = require('../models/partyMaster');
const Voucher = require('../models/voucher');
const BankTransaction = require('../models/bankTransaction');
const AssetDetails = require("../models/assetDetails");
const StockDetails = require("../models/stockDetails");
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
  const { name, type, parent, asset, description, assets, stocks } = req.body;

  try {
    // Create a new accounting head
    const newHead = new AccountingHead({
      name,
      type,
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
    const accountingHeads = await AccountingHead.find()
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
    const voucher = new Voucher(req.body);

    // Calculate debit and credit totals
    const debitTotal = voucher.transactions
      .filter((t) => t.type === 'Debit')
      .reduce((sum, t) => sum + t.amount, 0);

    const creditTotal = voucher.transactions
      .filter((t) => t.type === 'Credit')
      .reduce((sum, t) => sum + t.amount, 0);

    voucher.isBalanced = debitTotal === creditTotal;

    if (!voucher.isBalanced) {
      return res.status(400).json({ error: 'Debit and Credit amounts must balance before saving.' });
    }

    const savedVoucher = await voucher.save();
    res.status(201).json({ success: true, data: savedVoucher });
  } catch (error) {
    res.status(400).json({ success: false, data: 'Failed to create voucher', error });
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
    const vouchers = await Voucher.find({}).populate('payee').populate('transactions.accountHead');
    res.status(200).json({ success: true, data: vouchers });
  } catch (error) {
    res.status(500).json({ success: false, data: 'Failed to fetch vouchers', error });
  }
};

exports.getLastFourVouchers = async (req, res) => {
  try {
    const vouchers = await Voucher.find({})
      .sort({ date: -1 })
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
      .populate('voucher', 'narration voucherType')
      .sort({ date: 1 });

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

    // Mark month as closed (if necessary, update other systems or logs)
    res.status(200).json({ success: true, data: 'Month closed successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, data: 'Failed to close month.', error });
  }
};

// Year-End Processing
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

    // Check for completed year-end transactions
    const depreciationTransactions = await Voucher.find({ voucherType: 'Depreciation' });
    if (depreciationTransactions.length === 0) {
      return res.status(400).json({
        success: false,
        data: 'Cannot close year. Depreciation transactions are incomplete.',
      });
    }

    // Mark year as closed (if necessary, update other systems or logs)
    res.status(200).json({ success: true, data: 'Year closed successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, data: 'Failed to close year.', error });
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

    // Convert to ISO strings
    const formattedStartDate = parsedStartDate.toISOString();
    const formattedEndDate = parsedEndDate.toISOString();

    const filter = {
      date: { $gte: new Date(formattedStartDate), $lte: new Date(formattedEndDate) },
    };

    const vouchers = await Voucher.find({
      entryDate: { $gte: new Date(startDate), $lte: new Date(endDate) },
    });

    const bankTransactions = await BankTransaction.find(filter);
    
    let debitTotal = 0;
    let creditTotal = 0;

    vouchers.forEach((voucher) => {
      voucher.transactions.forEach((tx) => {
        if (tx.type === 'Debit') {
          debitTotal += tx.amount;
        } else if (tx.type === 'Credit') {
          creditTotal += tx.amount;
        }
      });
    });

    bankTransactions.forEach((transaction) => {
        debitTotal += transaction.debit;
        creditTotal += transaction.credit;
    });

    res.status(200).json({
      success: true,
      data: {
        debitTotal,
        creditTotal,
        isBalanced: debitTotal === creditTotal,
      },
    });
  } catch (error) {
    console.log(error);
    
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

    // Fetch vouchers within the date range
    const vouchers = await Voucher.find({
      entryDate: { $gte: start, $lte: end },
    });

    let revenue = 0;
    let expenses = 0;

    vouchers.forEach((voucher) => {
      voucher.transactions.forEach((transaction) => {
        if (transaction.type === 'Credit' && voucher.narration.toLowerCase().includes('Revenue'.toLowerCase())) {
          revenue += transaction.amount;
        } else if (transaction.type === 'Debit' && voucher.narration.toLowerCase().includes('Expense'.toLowerCase())) {
          expenses += transaction.amount;
        }
      });
    });

    const profitOrLoss = revenue - expenses;

    res.status(200).json({
      success: true,
      data: {
        revenue,
        expenses,
        profitOrLoss,
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

    let totalAssets = 0;
    let totalLiabilities = 0;

    transactions.forEach((transaction) => {
      totalAssets += transaction.debit || 0;
      totalLiabilities += transaction.credit || 0;
    });

    const equity = totalAssets - totalLiabilities;

    res.status(200).json({
      success: true,
      data: {
        totalAssets,
        totalLiabilities,
        equity,
      },
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