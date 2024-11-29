const Employee = require("../models/employee");
const PayGeneration = require("../models/payGeneration");
const PayBill = require("../models/payBill");
const Remittance = require("../models/remittance");
const _ = require('lodash')


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
        const {fullname, date_of_birth, cid, emp_id, tpn_acc_num, has_gis, gis_acc_num, has_pf, pf_acc_num, sav_acc_num, bank_name, bank_branch, benefits, deductions, qualifications} = req.body

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

        const savedEmployee = await employee.save()

        if(!savedEmployee || savedEmployee.errors){
            return res.status(400).json({error: 'Failed to create employee!', message: savedEmployee})
        }

        req.savedEmployee = {success: 'Employee created successfully!', message: savedEmployee}

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

exports.deleteEmployee = async (req, res,next) => {
    try {
        const employee = req.employee

        const deletedEmployee = await employee.remove()

        if(!deletedEmployee || deletedEmployee.errors){
            return res.status(400).json({error: 'Failed to delete employee!', message: deletedEmployee})
        }

        req.deletedEmployee = 'Employee deleted successfully!'

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
    const employees = await Employee.find()
      .skip(offset)
      .limit(limit)
      .select("_id fullname emp_id date_of_birth")
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

    // Calculate gross and net pay
    const gross_pay = basic_pay + allowances;
    const total_deductions = tds + pf + gis;
    const net_pay = gross_pay - total_deductions;

    // Create the Pay Generation document
    const payGeneration = new PayGeneration({
      employee: employee._id,
      basic_pay,
      allowances,
      tds,
      pf,
      gis,
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
exports.postPayBill = async (req, res) => {
  try {
    const { _id, pay_date } = req.body;

    if (!_id || !pay_date) {
      return res.status(400).json({
        error: "Employee ID and Pay Date are required",
        message: "Bad Request",
      });
    }

    // Fetch the generated pay details for the given employee and pay date
    const payGeneration = await PayGeneration.findOne({
      employee: _id,
      pay_date,
    });

    if (!payGeneration) {
      return res.status(404).json({
        error: "No pay generation record found for this employee on the given date",
      });
    }

    // Create a new Pay Bill entry from the pay generation record
    const payBill = new PayBill({
      employee: payGeneration.employee,
      basic_pay: payGeneration.basic_pay,
      allowances: payGeneration.allowances,
      tds: payGeneration.tds,
      pf: payGeneration.pf,
      gis: payGeneration.gis,
      gross_pay: payGeneration.gross_pay,
      net_pay: payGeneration.net_pay,
      pay_date: payGeneration.pay_date,
      status: 'Posted'
    });

    // Save the Pay Bill record
    const savedPayBill = await payBill.save();

    if (!savedPayBill) {
      return res.status(400).json({
        error: "Failed to post pay bill!",
        message: savedPayBill.errors,
      });
    }

    // Update the status of the pay generation record to "Posted"
    payGeneration.status = "Posted";
    await payGeneration.save();

    return res.status(200).json({
      success: "Pay bill posted successfully!",
      message: savedPayBill,
    });
  } catch (error) {
    return res.status(500).json({
      error: "Internal Server Error!",
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
    const totalDeductions = (payBill.tds || 0) + (payBill.pf || 0) + (payBill.gis || 0);
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

// Remittances Posting Report
exports.generateRemittancesPostingReport = async (req, res) => {
  try {
    const remittances = await Remittance.aggregate([
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


// Pay Slip Report
