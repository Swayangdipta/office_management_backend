const Employee = require("../models/employee");
const PayGeneration = require("../models/payGeneration");
const PayBill = require("../models/payBill");
const Remittance = require("../models/remittance");
const _ = require('lodash');
const Bank = require("../models/Bank");


exports.getEmployeeById = async (req,res,next,id) => {
    try {
        const employee = await Employee.findById(id)

        if(!employee || employee.errors){
            return res.status(404).json({error: 'Faild to get employee data!', message: employee})
        }

        req.employee = employee

        next()
    } catch (error) {
        return res.status(500).json({error: "Internal Server Error!", message: error });
    }
}

exports.getPayBillById = async (req, res, next, id) => {
  try {
      const payBill = await PayBill.findById(id);

      if (!payBill) {
          return res.status(404).json({ error: 'Pay Bill not found!', message: `No pay bill found with ID: ${id}` });
      }

      req.payBill = payBill; // Attach the payBill to the request object for further processing in the next middleware or controller

      next(); // Proceed to the next middleware or handler
  } catch (error) {
      return res.status(500).json({ error: "Internal Server Error", message: error.message });
  }
};

exports.getRemittanceById = async (req, res, next, remittanceId) => {
  try {
      const remittance = await Remittance.findById(remittanceId);

      if (!remittance) {
          return res.status(404).json({ error: 'Remittance not found!', message: `No remittance found with ID: ${remittanceId}` });
      }

      req.remittance = remittance; // Attach the remittance to the request object

      next(); // Proceed to the next middleware or handler
  } catch (error) {
      return res.status(500).json({ error: "Internal Server Error", message: error.message });
  }
};

exports.createEmployee = async (req,res,next) => {
    try {
        const {fullname, emp_type,  date_of_birth, cid, emp_id, tpn_acc_num, has_gis, gis_acc_num, has_pf, pf_acc_num, sav_acc_num, bank_name, bank_branch, benefits, deductions, qualifications} = req.body
        
        if (
            !fullname ||
            !date_of_birth ||
            !cid ||
            !emp_id ||
            !tpn_acc_num ||
            has_gis === undefined || // Validate has_gis (boolean)
            (has_gis && !gis_acc_num) || // If GIS is enabled, GIS account number is required
            has_pf === undefined || // Validate has_pf (boolean)
            (has_pf && !pf_acc_num) // If PF is enabled, PF account number is required
        ) {
            return res.status(400).json({ 
                error: 'Bad Request', 
                message: 'Missing or invalid required fields' 
            });
        }

        const employee = new Employee(req.body)
        employee.designation = req.designation._id

        const savedEmployee = await employee.save()

        if(!savedEmployee || savedEmployee.errors){
            return res.status(400).json({error: 'Failed to create employee!', message: savedEmployee})
        }

        req.savedEmployee = savedEmployee

        next()
    } catch (error) {
        return res.status(500).json({error: 'Internal Server Error!', message: error})
    }
}

exports.updateEmployee = async (req, res) => {
    try {
        let employee = req.employee

        employee = _.extend(employee, req.body)

        const updatedEmployee = await employee.save()

        if(!updatedEmployee || updatedEmployee.errors){
            return res.status(400).json({error: 'Failed to update employee!', message: updatedEmployee})
        }

        return res.status(200).json({success: 'Employee updated successfully!', message: updatedEmployee})
    } catch (error) {
      console.log(error);
      
        return res.status(500).json({error: 'Internal Server Error!', message: error})
    }
}

exports.updateEmployeeActiveStatus = async (req,res) => {
  try {
    const employee = req.employee
    employee.is_active = !employee.is_active
    const updatedEmployee = await employee.save()

    if(!updatedEmployee || updatedEmployee.errors){
      return res.status(400).json({error: 'Failed to update employee active status!', message: updatedEmployee})
    }

    return res.status(200).json({success: 'Employee active status updated successfully!', message: updatedEmployee})
  } catch (error) {
    return res.status(500).json({error: 'Internal Server Error!', message: error})
  }
}

exports.deleteEmployee = async (req, res,next) => {
    try {
        const employee = req.employee

        const deletedEmployee = await employee.deleteOne()

        if(!deletedEmployee || deletedEmployee.errors){
            return res.status(400).json({error: 'Failed to delete employee!', message: deletedEmployee})
        }

        console.log(employee);
        

        req.deletedEmployee = employee

        next()
    } catch (error) {      
        return res.status(500).json({error: 'Internal Server Error!', message: error})
    }
}

exports.getEmployees = async (req, res) => {
  try {
    let { pageNumber, limit } = req.body;

    // Set defaults
    pageNumber = parseInt(pageNumber) > 0 ? parseInt(pageNumber) : 1; // Default to page 1
    limit = parseInt(limit) > 0 ? parseInt(limit) : 15; // Default to 15 records per page

    const offset = (pageNumber - 1) * limit;

    // Fetch employees with pagination
    const employees = await Employee.find().populate('designation', 'title')
      // .skip(offset)
      // .limit(limit)
      .select("_id fullname emp_id cid benefits designation emp_type is_active")
      .exec();

    // Total record count for metadata
    const totalRecords = await Employee.countDocuments();

    if (!employees || employees.length === 0) {
      return res.status(404).json({
        error: "No employees found!",
        message: employees,
      });
    }

    // Response with pagination metadata
    return res.status(200).json({
      success: "Employees retrieved successfully!",
      data: employees,
      pagination: {
        totalRecords,
        currentPage: pageNumber,
        totalPages: Math.ceil(totalRecords / limit),
        limit,
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Internal Server Error!",
      message: error.message,
    });
  }
};

exports.getEmployee = async (req, res) => {
  if(req.employee){
    return res.status(200).json({success: true, data: req.employee})
  }

  return res.status(404).json({error: "Employee not found!"})
}

// Pay Generation and processing

exports.generatePay = async (req, res) => {
  try {
    const { emp_id, pay_date } = req.body;

    if (!emp_id || !pay_date) {
      return res.status(400).json({
        error: "Employee ID and Pay Date are required",
        message: "Bad Request",
      });
    }

    // Get the employee details from the Employee model
    const employee = await Employee.findOne({ emp_id });

    if (!employee) {
      return res.status(404).json({ error: "Employee not found!" });
    }

    // Extracting benefits and deductions from employee document
    const basic_pay = employee.benefits.basic_pay;
    const allowances = employee.benefits.allowances;
    const tds = employee.deductions.tds;
    const pf = employee.deductions.pf;
    const gis = employee.deductions.gis;
    const other_deductions = employee.deductions.other_deductions;

    // Calculate gross and net pay
    const gross_pay = basic_pay + allowances;
    const total_deductions = tds + pf + gis + other_deductions;
    const net_pay = gross_pay - total_deductions;

    // Create the Pay Generation document
    const payGeneration = new PayGeneration({
      employee: employee._id,
      basic_pay,
      allowances,
      tds,
      pf,
      gis,
      other_deductions,
      gross_pay,
      net_pay,
      pay_date,
    });

    const savedPay = await payGeneration.save();

    if (!savedPay) {
      return res.status(400).json({
        error: "Failed to generate pay!",
        message: savedPay.errors,
      });
    }

    return res.status(200).json({
      success: "Pay generated successfully!",
      message: savedPay,
    });
  } catch (error) {
    return res.status(500).json({
      error: "Internal Server Error!",
      message: error.message,
    });
  }
}

exports.getPayByEmployee = async (req, res) => {
  try {
    const { _id } = req.body;

    if (!_id) {
      return res.status(400).json({
        error: "Employee ID is required",
        message: "Bad Request",
      });
    }

    // Fetch pay details for the given employee
    const payDetails = await PayGeneration.find({ employee: _id })
      .populate("employee")
      .exec();

    if (!payDetails || payDetails.length === 0) {
      return res.status(404).json({
        error: "No pay records found for this employee",
      });
    }

    return res.status(200).json({
      success: "Pay details retrieved successfully!",
      payDetails,
    });
  } catch (error) {
    return res.status(500).json({
      error: "Internal Server Error!",
      message: error.message,
    });
  }
}

// Pay Bill Posting
exports.postPayBillForMonth = async (req, res) => {
  try {
    const { month, bankOrCash, bank, voucher_date, signatory } = req.body;

    // Validate inputs
    if (!month || !bankOrCash || !voucher_date || !signatory) {
      return res.status(400).json({
        error: "Month, Bank or Cash, Voucher Date, and Signatory are required.",
      });
    }

    if (bankOrCash === "Bank" && !bank) {
      return res.status(400).json({
        error: "Bank ID is required when Bank is selected.",
      });
    }

    // Prepare date range for the selected month
    const startDate = new Date(`${month}-01`);
    const endDate = new Date(`${month}-31`);

    // Fetch eligible pay generation records
    const payGenerations = await PayGeneration.find({
      pay_date: { $gte: startDate, $lt: endDate },
      status: { $ne: "Posted" }, // Exclude already posted records
    });

    if (!payGenerations.length) {
      return res.status(404).json({
        error: "No pay generation records found for the selected month.",
      });
    }

    // Map pay generation records to pay bill documents
    const payBills = payGenerations.map((payGen) => {
      const basic_pay = parseFloat(payGen.basic_pay || 0);
      const allowances = parseFloat(payGen.allowances || 0);
      const tds = parseFloat(payGen.tds || 0);
      const pf = parseFloat(payGen.pf || 0);
      const gis = parseFloat(payGen.gis || 0);
      const other_deductions = parseFloat(payGen.other_deductions || 0);

      const gross_pay = parseFloat(basic_pay + allowances);
      const total_deductions = parseFloat(tds + pf + gis + other_deductions);
      const net_pay = parseFloat(Math.max(0, gross_pay - total_deductions)); // Ensure net pay is never negative

      return {
        employee: payGen.employee,
        basic_pay,
        allowances,
        tds,
        pf,
        gis,
        other_deductions,
        gross_pay,
        net_pay,
        pay_date: payGen.pay_date,
        status: "Posted",
        bank: bankOrCash === "Bank" ? bank : null,
        voucher_date,
        signatory,
      };
    });

    // Insert pay bills into the database
    await PayBill.insertMany(payBills);

    // Update the status of pay generation records
    await PayGeneration.updateMany(
      {
        pay_date: { $gte: startDate, $lt: endDate },
        status: { $ne: "Posted" },
      },
      { $set: { status: "Posted" } }
    );

    return res.status(200).json({
      success: "Pay bills posted successfully.",
      count: payBills.length,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Internal Server Error",
      message: error.message,
    });
  }
};

exports.getPayBillPreview = async (req, res) => {
  try {
    const { month, bankOrCash, bank, voucher_date, signatory } = req.body;
    
    // Validate inputs
    if (!month || !bankOrCash || !voucher_date || !signatory) {
      return res.status(400).json({
        error: "Month, Bank or Cash, Voucher Date, and Signatory are required.",
      });
    }

    // Validate bank selection if bankOrCash is "Bank"
    if (bankOrCash === "Bank" && !bank) {
      return res.status(400).json({
        error: "Bank ID is required when Bank is selected.",
      });
    }

    // Prepare date range for the selected month
    const startDate = new Date(`${month}-01`);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1); // Advance one month
    endDate.setDate(0); // Set to the last day of the month

    console.log("Start Date:", startDate);
    console.log("End Date:", endDate);

    // Fetch eligible pay generation records for the specified month
    const payGenerations = await PayGeneration.find({
      pay_date: { $gte: startDate, $lte: endDate }, // Ensure it captures the entire month
      status: { $ne: "Posted" }, // Exclude already posted records
    }).populate("employee", "fullname");

    console.log("Query Results:", payGenerations);

    if (!payGenerations.length) {
      return res.status(404).json({
        error: "No pay generation records found for the selected month.",
      });
    }

    // Calculate totals
    const totals = payGenerations.reduce(
      (acc, payGen) => {
        acc.totalGrossPay += parseFloat(payGen.gross_pay || 0);
        acc.totalRecoveries += parseFloat(
          (payGen.tds || 0) +
          (payGen.pf || 0) +
          (payGen.gis || 0) +
          (payGen.other_deductions || 0)
        );
        acc.totalNetPayment += parseFloat(payGen.net_pay || 0);
        return acc;
      },
      { totalGrossPay: 0, totalRecoveries: 0, totalNetPayment: 0 }
    );

    // Return the preview data
    return res.status(200).json({
      success: "Preview fetched successfully.",
      totals,
      payDetails: payGenerations.map((payGen) => ({
        employeeName: payGen.employee.fullname,
        grossPay: payGen.gross_pay,
        totalDeductions:
          parseFloat(payGen.tds || 0) +
          parseFloat(payGen.pf || 0) +
          parseFloat(payGen.gis || 0) +
          parseFloat(payGen.other_deductions || 0),
        netPay: payGen.net_pay,
      })),
      details: {
        bankOrCash,
        bank,
        voucher_date,
        signatory,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Internal Server Error",
      message: error.message,
    });
  }
};

exports.undoPostPayBill = async (req, res) => {
  try {
    const { month, bankOrCash, bank, voucher_date, signatory } = req.body;

    // Validate inputs
    if (!month || !bankOrCash || !voucher_date || !signatory) {
      return res.status(400).json({
        error: "Month, Bank or Cash, Voucher Date, and Signatory are required.",
      });
    }

    if (bankOrCash === "Bank" && !bank) {
      return res.status(400).json({
        error: "Bank ID is required when Bank is selected.",
      });
    }

    // Prepare date range for the selected month
    const startDate = new Date(`${month}-01`);
    const endDate = new Date(`${month}-31`);

    // Fetch pay bills created during the postPayBill process
    const payBills = await PayBill.find({
      pay_date: { $gte: startDate, $lt: endDate },
      status: "Posted"
    });

    if (!payBills.length) {
      return res.status(404).json({
        error: "No pay bills found for the selected month to undo.",
      });
    }

    // Extract employee IDs for the update
    const employeeIds = payBills.map(payBill => payBill.employee);

    // Remove the pay bills from the database
    await PayBill.deleteMany({ _id: { $in: payBills.map(payBill => payBill._id) } });

    // Update the status of pay generation records to "Not Posted"
    await PayGeneration.updateMany(
      {
        employee: { $in: employeeIds },
        pay_date: { $gte: startDate, $lt: endDate }
      },
      { $set: { status: "Not Posted" } }
    );

    return res.status(200).json({
      success: "Pay bills undone successfully.",
      count: payBills.length,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Internal Server Error",
      message: error.message,
    });
  }
};



// Remittances posting

exports.postRemittance = async (req, res) => {
  try {
    const { remittance_type, remittance_date } = req.body;

    // Validate input
    if (!remittance_type || !remittance_date) {
      return res.status(400).json({
        error: "Remittance type and date are required",
        message: "Bad Request",
      });
    }

    // Validate remittance type
    if (!["TDS", "PF", "GIS"].includes(remittance_type)) {
      return res.status(400).json({
        error: "Invalid Remittance Type",
        message: "Remittance type must be one of TDS, PF, or GIS",
      });
    }

    // Fetch pay bills with "Posted" status
    const payBills = await PayBill.find({ status: "Posted" });

    if (!payBills || payBills.length === 0) {
      return res.status(404).json({
        error: "No posted pay bills found for remittance",
      });
    }

    const remittances = [];

    // Process each pay bill
    for (const bill of payBills) {
      let amount;

      // Determine remittance amount based on type
      switch (remittance_type) {
        case "TDS":
          amount = bill.tds;
          break;
        case "PF":
          amount = bill.pf;
          break;
        case "GIS":
          amount = bill.gis;
          break;
        case 'OTHER': 
          amount = bill.other_deductions;
        default:
          amount = 0;
      }

      // Skip if amount is invalid or zero
      if (!amount || amount <= 0) {
        continue;
      }

      // Check for existing remittance
      const existingRemittance = await Remittance.findOne({
        remittance_type,
        employee: bill.employee,
        remittance_date,
      });

      if (existingRemittance) {
        // Skip duplicates
        continue;
      }

      // Create and save new remittance
      const remittance = new Remittance({
        remittance_type,
        employee: bill.employee,
        amount,
        remittance_date,
      });

      const savedRemittance = await remittance.save();
      remittances.push(savedRemittance);
    }

    // Handle cases where no remittances were created
    if (remittances.length === 0) {
      return res.status(400).json({
        error: "No valid remittance records found for posting",
      });
    }

    // Success response
    return res.status(200).json({
      success: "Remittances posted successfully!",
      remittances,
    });
  } catch (error) {
    // Error handling
    return res.status(500).json({
      error: "Internal Server Error",
      message: error.message,
    });
  }
};

exports.processRemittance = async (req, res) => {
  try {
    const { month, signatory, category, remittanceTo, bank, date } = req.body;

    if (!month || !signatory || !category || !remittanceTo || !bank || !date) {
      return res.status(400).json({ error: "All fields are required." });
    }

    // Prepare date range for the selected month
    const startDate = new Date(`${month}-01`);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);
    endDate.setDate(0);

    // Fetch pay bills for the given month
    const payBills = await PayBill.find({
      pay_date: { $gte: startDate, $lte: endDate },
      status: "Posted",
    });

    if (!payBills.length) {
      return res.status(404).json({
        error: `No posted pay bills found for the selected month: ${month}.`,
      });
    }

    // Calculate remittance details
    let totalDrAmount = 0;
    const details = payBills.map((bill) => {
      let amount = 0;
      switch (category) {
        case "TDS":
          amount = bill.tds || 0;
          break;
        case "PF":
          amount = bill.pf || 0;
          break;
        case "GIS":
          amount = bill.gis || 0;
          break;
        case "Other":
          amount = bill.other_deductions || 0;
          break;
      }

      totalDrAmount += amount;

      return {
        bh: bill.bh || "N/A",
        obc: bill.obc || "N/A",
        budgetLine: bill.budgetLine || "N/A",
        drAmount: amount,
        crAmount: 0,
      };
    });

    res.status(200).json({
      details,
      totalDrAmount,
      message: `Processed remittance data successfully for the month: ${month}.`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to process remittance data", message: error.message });
  }
};

exports.saveRemittance = async (req,res) => {
  try {
    const { month, signatory, category, remittanceTo, bank, date } = req.body;

    if (!month || !signatory || !category || !remittanceTo || !bank || !date) {
      return res.status(400).json({ error: "All fields are required." });
    }

    // Prepare date range for the selected month
    const startDate = new Date(`${month}-01`);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);
    endDate.setDate(0);

    // Fetch posted pay bills for the given month
    const payBills = await PayBill.find({
      pay_date: { $gte: startDate, $lte: endDate },
      status: "Posted",
    });

    if (!payBills.length) {
      return res.status(404).json({
        error: `No posted pay bills found for the selected month: ${month}.`,
      });
    }

    const remittances = payBills.map((bill) => {
      let amount = 0;
      switch (category) {
        case "TDS":
          amount = bill.tds || 0;
          break;
        case "PF":
          amount = bill.pf || 0;
          break;
        case "GIS":
          amount = bill.gis || 0;
          break;
        case "Other":
          amount = bill.other_deductions || 0;
          break;
      }

      return {
        month,
        signatory,
        remittance_type: category,
        employee: bill.employee._id,
        amount,
        remittance_date: bill.pay_date,
        posting_date: date,
        bank: bank ? (bill.bank ? bill.bank._id : null) : null,
        bh: bill.bh || "N/A",
        obc: bill.obc || "N/A",
        budgetLine: bill.budgetLine || "N/A",
        drAmount: amount,
        crAmount: 0,
      };
    });

    await Remittance.insertMany(remittances);

    res.status(200).json({
      success: `Remittance data saved successfully for the month: ${month}.`,
      count: remittances.length,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to save remittance data", message: error.message });
  }
}

exports.undoRemittance = async (req,res) => {
  try {
    const { month, category } = req.body;

    if (!month || !category) {
      return res.status(400).json({ error: "Month and category are required." });
    }

    // Prepare date range for the selected month
    const startDate = new Date(`${month}-01`);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);
    endDate.setDate(0);

    // Delete remittance records for the given month and category
    const deletedRecords = await Remittance.deleteMany({
      remittance_date: { $gte: startDate, $lte: endDate },
      category,
    });

    if (!deletedRecords.deletedCount) {
      return res.status(404).json({
        error: `No remittance records found for the month: ${month} and category: ${category}.`,
      });
    }

    res.status(200).json({
      success: `Remittance records undone successfully for the month: ${month}.`,
      deletedCount: deletedRecords.deletedCount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to undo remittance posting", message: error.message });
  }
}

// Pay slip

exports.getPaySlip = async (req, res) => {
  try {
    const { _id, pay_date } = req.body;
    const months = ["January", "February","March","April","May","June","July","August","September","October","November","December"]
    if (!_id || !pay_date) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Employee ID, month, and year are required.",
      });
    }

    const month = months[parseInt(pay_date.split("-")[1]) - 1];
    const year = pay_date.split("-")[0]

    
    // Find employee
    const employee = await Employee.findOne({ _id });
    if (!employee) {
      return res.status(404).json({ error: "Employee not found!" });
    }

    // Fetch pay bill
    const payBill = await PayBill.findOne({
      employee: employee._id,
      pay_date,
      status: "Posted",  // Make sure the pay bill is marked as 'Posted'
    });

    if (!payBill) {
      return res.status(404).json({ error: "Pay bill not found for the given period!" });
    }

    // Calculate total benefits, deductions, and net salary
    const totalBenefits = (payBill.basic_pay || 0) + (payBill.allowances || 0);
    const totalDeductions = (payBill.tds || 0) + (payBill.pf || 0) + (payBill.gis || 0);
    const netSalary = totalBenefits - totalDeductions;

    // Construct pay slip
    const paySlip = {
      employee: {
        fullname: employee.fullname,
        emp_id: employee.emp_id,
        bank_name: employee.bank_name,
        bank_branch: employee.bank_branch,
        sav_acc_num: employee.sav_acc_num,
      },
      pay_period: { month, year },
      benefits: {
        basic_pay: payBill.basic_pay,
        allowances: payBill.allowances,
        total: totalBenefits,
      },
      deductions: {
        tds: payBill.tds,
        pf: payBill.pf,
        gis: payBill.gis,
        total: totalDeductions,
      },
      net_salary: netSalary,
    };

    return res.status(200).json({
      success: "Pay slip fetched successfully!",
      paySlip,
    });
  } catch (error) {
    return res.status(500).json({
      error: "Internal Server Error",
      message: error.message,
    });
  }
};

// LPC

exports.generateLPC = async (req, res) => {
  try {
    const { _id, pay_date } = req.body;
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    if (!_id || !pay_date) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Employee ID, Pay Date are required.",
      });
    }

    // Convert pay_date to start and end of the day range
    const startOfDay = new Date(pay_date); // Sets time to 00:00:00
    const endOfDay = new Date(pay_date); 
    endOfDay.setUTCDate(endOfDay.getUTCDate() + 1); // Sets to the next day's 00:00:00

    // Extract month and year from pay_date
    const month = months[parseInt(pay_date.split("-")[1]) - 1];
    const year = pay_date.split("-")[0];

    // Find the employee by employee ID
    const employee = await Employee.findOne({ _id });
    if (!employee) {
      return res.status(404).json({ error: "Employee not found!" });
    }

    // Fetch the pay bill for the given pay_date (the full date range for the specified day)
    const payBill = await PayBill.findOne({
      employee: employee._id,
      pay_date: { $gte: startOfDay, $lt: endOfDay }, // Ensure the pay_date falls within the specified day
      status: "Posted",  // Ensure the pay bill is posted
    });

    if (!payBill) {
      return res.status(404).json({ error: "Pay bill not found for the given period!" });
    }

    // Calculate benefits, deductions, and net salary for LPC
    const totalBenefits = (payBill.basic_pay || 0) + (payBill.allowances || 0);
    const totalDeductions = (payBill.tds || 0) + (payBill.pf || 0) + (payBill.gis || 0) + (payBill.other_deductions || 0);
    const netSalary = totalBenefits - totalDeductions;

    // Construct the LPC document
    const lpc = {
      employee: {
        fullname: employee.fullname,
        emp_id: employee.emp_id,
        cid: employee.cid,
        bank_name: employee.bank_name,
        bank_branch: employee.bank_branch,
        sav_acc_num: employee.sav_acc_num,
      },
      pay_period: { month, year },
      benefits: {
        basic_pay: payBill.basic_pay,
        allowances: payBill.allowances,
        total: totalBenefits,
      },
      deductions: {
        tds: payBill.tds,
        pf: payBill.pf,
        gis: payBill.gis,
        total: totalDeductions,
      },
      net_salary: netSalary,
      remarks: "Last Pay Certificate for the final settlement.",
    };

    return res.status(200).json({
      success: "LPC generated successfully!",
      lpc,
    });
  } catch (error) {
    return res.status(500).json({
      error: "Internal Server Error",
      message: error.message,
    });
  }
};


// Reports
// Employee Master Report

// Employee Master Report (doesn't depend on dates)
exports.generateEmployeeMasterReport = async (req, res) => {
  try {
    const employees = await Employee.find({});

    if (!employees || employees.length === 0) {
      return res.status(404).json({ error: "No employees found." });
    }

    return res.status(200).json({
      success: "Employee master report generated successfully.",
      report: employees,
    });
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error", message: error.message });
  }
};

// Pay Generation Report
exports.generatePayGenerationReport = async (req, res) => {
  try {
    const payBills = await PayBill.aggregate([
      {
        $lookup: {
          from: "employees", // The collection name for Employee documents
          localField: "employee", // The field in PayBill documents referencing the Employee
          foreignField: "_id", // The field in Employee documents being referenced
          as: "employee", // The resulting array field in each PayBill document
        },
      },
      {
        $unwind: {
          path: "$employeeDetails", // Deconstruct the array to objects
          preserveNullAndEmptyArrays: true, // Keep records even if there's no match
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, // Group by date
          records: { $push: "$$ROOT" }, // Collect all matching records
        },
      },
      { $sort: { _id: 1 } }, // Sort by date (ascending)
    ]);    

    if (!payBills || payBills.length === 0) {
      return res.status(404).json({ error: "No pay generation data found." });
    }

    return res.status(200).json({
      success: "Pay generation report grouped by date generated successfully.",
      report: payBills,
    });
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error", message: error.message });
  }
};

// Remittances Posting Report
exports.generateRemittancesPostingReport = async (req, res) => {
  try {
    const remittances = await Remittance.aggregate([
      {
        $lookup: {
          from: "employees", // The collection name for Employee documents
          localField: "employee", // The field in Remittance documents referencing the Employee
          foreignField: "_id", // The field in Employee documents being referenced
          as: "employee", // The resulting array field in each Remittance document
        },
      },
      {
        $unwind: {
          path: "$employee", // Deconstruct the array to objects
          preserveNullAndEmptyArrays: true, // Keep records even if there's no match
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, // Group by date
          records: { $push: "$$ROOT" }, // Collect all matching records
        },
      },
      { $sort: { _id: 1 } }, // Sort by date (ascending)
    ]);
    

    if (!remittances || remittances.length === 0) {
      return res.status(404).json({ error: "No remittance postings found." });
    }

    return res.status(200).json({
      success: "Remittance posting report grouped by date generated successfully.",
      report: remittances,
    });
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error", message: error.message });
  }
};

// Pay Bill Posting Report
exports.generatePayBillPostingReport = async (req, res) => {
  try {
    const payBillPostings = await PayBill.aggregate([
      { $match: { status: 'posted' } }, // Filter only posted records
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, // Group by date
          records: { $push: "$$ROOT" }, // Collect all matching records
        },
      },
      { $sort: { _id: 1 } }, // Sort by date (ascending)
    ]);

    if (!payBillPostings || payBillPostings.length === 0) {
      return res.status(404).json({ error: "No pay bill postings found." });
    }

    return res.status(200).json({
      success: "Pay bill posting report grouped by date generated successfully.",
      report: payBillPostings,
    });
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error", message: error.message });
  }
};
// Add-on's

exports.getPayPreview = async (req, res) => {
  try {
    const { month } = req.body; // Month format: YYYY-MM

    if (!month) {
      return res.status(400).json({
        error: "Please select a month!",
        message: "Bad Request",
      });
    }

    // Check if pay has already been finalized for the month
    const existingPays = await PayGeneration.find({
      pay_date: { 
        $gte: new Date(`${month}-01`),
        $lt: new Date(`${month}-31`)
      },
    });

    const isFinalized = existingPays.length > 0;

    // Fetch all active employees
    const activeEmployees = await Employee.find({ is_active: true });

    if (activeEmployees.length === 0) {
      return res.status(404).json({
        error: "No active employees found.",
      });
    }

    // Calculate pay details for preview
    const previewData = activeEmployees.map((employee) => {
      const { basic_pay, allowances } = employee.benefits;
      const { tds, pf, gis, other_deductions } = employee.deductions;

      const gross_pay = parseFloat(basic_pay) + parseFloat(allowances);
      const total_deductions = parseFloat(tds) + parseFloat(pf) + parseFloat(gis) + parseFloat(other_deductions);
      const net_pay = gross_pay - total_deductions;

      return {
        emp_id: employee.emp_id,
        name: employee.fullname,
        cid: employee.cid,
        basic_pay,
        allowances,
        tds,
        pf,
        gis,
        other_deductions,
        total_deductions,
        gross_pay,
        net_pay,
        status: isFinalized ? "Finalized" : "Pending",
      };
    });

    return res.status(200).json({
      success: "Preview fetched successfully.",
      isFinalized,
      employees: previewData,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Internal Server Error",
      message: error.message,
    });
  }
};

exports.finalizePayForMonth = async (req, res) => {
  try {
    const { month, action } = req.body; // action: "finalize" or "unfinalize"

    if (!month || !action) {
      return res.status(400).json({
        error: "Month and action (finalize/unfinalize) are required.",
      });
    }

    if (action === "finalize") {
      // Check if already finalized
      const existingPays = await PayGeneration.find({
        pay_date: {
          $gte: new Date(`${month}-01`),
          $lt: new Date(`${month}-31`),
        },
      });

      if (existingPays.length > 0) {
        return res.status(400).json({
          error: "Pay already finalized for this month.",
        });
      }

      // Fetch active employees
      const activeEmployees = await Employee.find({ is_active: true });

      const payDocuments = activeEmployees.map((employee) => {
        const basic_pay = parseFloat(employee.benefits.basic_pay || 0);
        const allowances = parseFloat(employee.benefits.allowances || 0);
        const tds = parseFloat(employee.deductions.tds || 0);
        const pf = parseFloat(employee.deductions.pf || 0);
        const gis = parseFloat(employee.deductions.gis || 0);
        const other_deductions = parseFloat(employee.deductions.other_deductions || 0);

        const gross_pay = basic_pay + allowances;
        const total_deductions = tds + pf + gis + other_deductions;
        const net_pay = Math.max(0, gross_pay - total_deductions); // Ensure net_pay is never negative

        return {
          employee: employee._id,
          basic_pay,
          allowances,
          tds,
          pf,
          gis,
          other_deductions,
          gross_pay,
          net_pay,
          pay_date: new Date(`${month}-01`),
          status: "Pending",
        };
      });

      await PayGeneration.insertMany(payDocuments);

      return res.status(200).json({
        success: "Pay finalized successfully.",
      });
    } else if (action === "unfinalize") {
      // Delete pay for the given month
      await PayGeneration.deleteMany({
        pay_date: {
          $gte: new Date(`${month}-01`),
          $lt: new Date(`${month}-31`),
        },
      });

      return res.status(200).json({
        success: "Pay unfinalized successfully.",
      });
    } else {
      return res.status(400).json({ error: "Invalid action specified." });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Internal Server Error",
      message: error.message,
    });
  }
};

exports.getBanks = async (req,res) => {
  try {
    const banks = await Bank.find()

    if(!banks || banks.length === 0) {
      return res.status(404).json({ error: "No banks found." });
      }
    return res.status(200).json(banks);
  } catch (error) {
    return res.status(500).json({
      error: "Internal Server Error",
      message: error.message,
    });
  }
}