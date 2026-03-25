const { getMonthlyBill } = require('../models/db_controller');
const Student = require('../models/Student');
const Transaction = require('../models/Transaction');
const { authenticateToken, requireStudent, requireManager } = require('./AuthController');

// Get student profile
const getStudentProfile = async (req, res) => {
  try {
    const rollNo = req.user.rollNo;

    let student = await Student.findByPk(rollNo, {
      attributes: ['rollNo', 'name', 'email', 'roomNo', 'messCardStatus']
    });

    // If manager is viewing student dashboard for reference, show the first student or own info
    if (!student && req.user.role === 'manager') {
      student = await Student.findOne({
        attributes: ['rollNo', 'name', 'email', 'roomNo', 'messCardStatus']
      });
    }

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found.'
      });
    }

    res.status(200).json({
      success: true,
      data: student
    });
  } catch (error) {
    console.error('Error fetching student profile:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.'
    });
  }
};

// Get student's monthly bill - delegates to db_controller to avoid raw Sequelize.Op usage
const getStudentBill = async (req, res) => {
  try {
    const rollNo = req.user?.rollNo;
    if (!rollNo) {
      return res.status(400).json({ success: false, message: 'Student rollNo not found in token.' });
    }

    const billData = await getMonthlyBill(rollNo);

    res.status(200).json({
      success: true,
      data: {
        totalBill: billData.totalBill || 0,
        monthlyCharge: billData.monthlyCharge || 0,
        extrasPurchased: billData.totalExtras || 0
      }
    });
  } catch (error) {
    console.error('Error fetching student bill:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.'
    });
  }
};

// Get student's transaction history
const getTransactionHistory = async (req, res) => {
  try {
    const rollNo = req.user.rollNo;

    const transactions = await Transaction.findAll({
      where: { studentRollNo: rollNo },
      order: [['date', 'DESC']],
      limit: 100
    });

    // Transform data to match frontend expectations
    const transformedTransactions = transactions.map(transaction => ({
      id: transaction.id,
      date: transaction.date ? transaction.date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      description: transaction.itemName || transaction.type || 'Transaction',
      amount: transaction.amount,
      type: transaction.type === 'Monthly Fee' ? 'charge' : 
            transaction.type === 'Extra Item' ? 'extra' : 'payment'
    }));

    res.status(200).json({
      success: true,
      data: transformedTransactions
    });
  } catch (error) {
    console.error('Error fetching transaction history:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.'
    });
  }
};

// Update student profile
const updateStudentProfile = async (req, res) => {
  try {
    const rollNo = req.user.rollNo;
    const { name, email, roomNo } = req.body;

    const student = await Student.findByPk(rollNo);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found.'
      });
    }

    // Check if email is already used by another student
    if (email && email !== student.email) {
      const existingEmail = await Student.findOne({
        where: { email, rollNo: { [require('sequelize').Op.ne]: rollNo } }
      });
      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: 'Email is already in use.'
        });
      }
    }

    // Update fields
    if (name) student.name = name;
    if (email) student.email = email;
    if (roomNo) student.roomNo = roomNo;

    await student.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      data: {
        rollNo: student.rollNo,
        name: student.name,
        email: student.email,
        roomNo: student.roomNo,
        messCardStatus: student.messCardStatus
      }
    });
  } catch (error) {
    console.error('Error updating student profile:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.'
    });
  }
};

// Get all students (Manager only)
const getAllStudents = async (req, res) => {
  try {
    const students = await Student.findAll({
      attributes: ['rollNo', 'name', 'email', 'roomNo', 'messCardStatus'],
      order: [['name', 'ASC']]
    });

    res.status(200).json({
      success: true,
      data: students
    });
  } catch (error) {
    console.error('Error fetching all students:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.'
    });
  }
};

// Get pending student registrations (Manager only)
const getPendingStudents = async (req, res) => {
  try {
    const pendingStudents = await Student.findAll({
      where: { messCardStatus: 'Suspended' },
      attributes: ['rollNo', 'name', 'email', 'roomNo', 'messCardStatus'],
      order: [['createdAt', 'ASC']]
    });

    res.status(200).json({
      success: true,
      data: pendingStudents
    });
  } catch (error) {
    console.error('Error fetching pending students:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.'
    });
  }
};

module.exports = {
  getStudentProfile,
  getStudentBill,
  getTransactionHistory,
  updateStudentProfile,
  getAllStudents,
  getPendingStudents
};
