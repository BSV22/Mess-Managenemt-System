const { submitRebate, processRebate } = require('../models/db_controller');
const RebateRequest = require('../models/Rebate');
const Student = require('../models/Student');
const { authenticateToken, requireStudent, requireManager } = require('./AuthController');

// Submit a rebate request (Student)
const submitRebateRequest = async (req, res) => {
  try {
    const rollNo = req.user.rollNo;
    const { startDate, endDate, reason } = req.body;

    if (!startDate || !endDate || !reason) {
      return res.status(400).json({
        success: false,
        message: 'startDate, endDate, and reason are required.'
      });
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();

    if (start >= end) {
      return res.status(400).json({
        success: false,
        message: 'End date must be after start date.'
      });
    }

    if (start < now.setHours(0, 0, 0, 0)) {
      return res.status(400).json({
        success: false,
        message: 'Start date cannot be in the past.'
      });
    }

    const rebate = await submitRebate(rollNo, startDate, endDate, reason);

    res.status(201).json({
      success: true,
      message: 'Rebate request submitted successfully.',
      data: rebate
    });
  } catch (error) {
    console.error('Error submitting rebate request:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get student's rebate requests
const getStudentRebates = async (req, res) => {
  try {
    const rollNo = req.user.rollNo;

    const rebates = await RebateRequest.findAll({
      where: { studentRollNo: rollNo },
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      data: rebates
    });
  } catch (error) {
    console.error('Error fetching student rebates:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.'
    });
  }
};

// Get all rebate requests (Manager)
const getAllRebates = async (req, res) => {
  try {
    const rebates = await RebateRequest.findAll({
      include: [{
        model: Student,
        attributes: ['name', 'email', 'roomNo'],
        as: 'student'
      }],
      order: [['createdAt', 'DESC']]
    });

    const formattedRebates = rebates.map(rebate => ({
      requestId: rebate.requestId,
      studentRollNo: rebate.studentRollNo,
      studentName: rebate.student?.name || 'Unknown',
      studentEmail: rebate.student?.email || '',
      studentRoom: rebate.student?.roomNo || '',
      startDate: rebate.startDate,
      endDate: rebate.endDate,
      reason: rebate.reason,
      status: rebate.status,
      createdAt: rebate.createdAt
    }));

    res.status(200).json({
      success: true,
      data: formattedRebates
    });
  } catch (error) {
    console.error('Error fetching all rebates:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.'
    });
  }
};

// Process rebate request (Manager)
const processRebateRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { decision, rebateAmountPerDay } = req.body;

    if (!['Approved', 'Rejected'].includes(decision)) {
      return res.status(400).json({
        success: false,
        message: 'Decision must be Approved or Rejected.'
      });
    }

    const result = await processRebate(requestId, decision, rebateAmountPerDay);

    res.status(200).json({
      success: true,
      message: `Rebate request ${decision.toLowerCase()} successfully.`,
      data: result
    });
  } catch (error) {
    console.error('Error processing rebate request:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  submitRebateRequest,
  getStudentRebates,
  getAllRebates,
  processRebateRequest
};
