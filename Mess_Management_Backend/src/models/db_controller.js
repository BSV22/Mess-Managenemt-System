const sequelize = require('../config/db');
const Student = require('./Student');
const Transaction = require('./Transaction');
const RebateRequest = require('./Rebate');
const Feedback = require('./Feedback');
const ExtraItem = require('./ExtraItem');
const Menu = require('./Menu');
const MessManager = require('./MessManager');

// ==========================================
// STUDENT FUNCTIONS
// ==========================================

/**
 * 1. Purchase Extra Item (Transactional)
 * Deducts stock from inventory AND creates a transaction record.
 */
const buyExtraItem = async (rollNo, extraItemId, quantityToBuy) => {
  const t = await sequelize.transaction();

  try {
    const item = await ExtraItem.findByPk(extraItemId, { transaction: t });
    
    if (!item || !item.isAvailable) {
      throw new Error('Item is currently not available in the menu.');
    }
    if (item.stockQuantity < quantityToBuy) {
      throw new Error(`Insufficient stock. Only ${item.stockQuantity} left.`);
    }

    item.stockQuantity -= quantityToBuy;
    if (item.stockQuantity === 0) {
      item.isAvailable = false;
    }
    await item.save({ transaction: t });

    const totalCost = item.price * quantityToBuy;
    const purchase = await Transaction.create({
      studentRollNo: rollNo,
      amount: totalCost,
      type: 'Extra Item',
      status: 'Completed',
      date: new Date()
    }, { transaction: t });

    await t.commit();
    return purchase;

  } catch (error) {
    await t.rollback();
    throw error;
  }
};

/**
 * 2. Get Student's Monthly Bill
 */
const getMonthlyBill = async (rollNo) => {
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const totalBill = await Transaction.sum('amount', {
    where: {
      studentRollNo: rollNo,
      status: 'Completed',
      [sequelize.Op.and]: [
        sequelize.where(sequelize.fn('EXTRACT', sequelize.literal('MONTH FROM "date"')), currentMonth),
        sequelize.where(sequelize.fn('EXTRACT', sequelize.literal('YEAR FROM "date"')), currentYear)
      ]
    }
  }) || 0;

  const monthlyCharge = await Transaction.sum('amount', {
    where: {
      studentRollNo: rollNo,
      type: 'Monthly Fee',
      status: 'Completed',
      [sequelize.Op.and]: [
        sequelize.where(sequelize.fn('EXTRACT', sequelize.literal('MONTH FROM "date"')), currentMonth),
        sequelize.where(sequelize.fn('EXTRACT', sequelize.literal('YEAR FROM "date"')), currentYear)
      ]
    }
  }) || 0;

  const totalExtras = await Transaction.sum('amount', {
    where: {
      studentRollNo: rollNo,
      type: 'Extra Item',
      status: 'Completed',
      [sequelize.Op.and]: [
        sequelize.where(sequelize.fn('EXTRACT', sequelize.literal('MONTH FROM "date"')), currentMonth),
        sequelize.where(sequelize.fn('EXTRACT', sequelize.literal('YEAR FROM "date"')), currentYear)
      ]
    }
  }) || 0;

  return { totalBill, monthlyCharge, totalExtras }; 
};

/**
 * 3. Submit Rebate Request
 */
const submitRebate = async (rollNo, startDate, endDate, reason) => {
  return await RebateRequest.create({
    studentRollNo: rollNo,
    startDate,
    endDate,
    reason,
    status: 'Pending'
  });
};

/**
 * 4. Submit Feedback
 */
const submitFeedback = async (rollNo, rating, category, comment) => {
  return await Feedback.create({
    studentRollNo: rollNo,
    rating,
    category,
    comment
  });
};


// ==========================================
// MANAGER FUNCTIONS
// ==========================================

/**
 * 5. Process Rebate Request (Transactional)
 */
const processRebate = async (requestId, managerDecision, rebateAmountPerDay = 150) => {
  const t = await sequelize.transaction();

  try {
    const request = await RebateRequest.findByPk(requestId, { transaction: t });
    if (!request) throw new Error('Rebate request not found.');

    request.status = managerDecision;
    await request.save({ transaction: t });

    if (managerDecision === 'Approved') {
      const start = new Date(request.startDate);
      const end = new Date(request.endDate);
      const days = Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;
      const totalCredit = -(days * rebateAmountPerDay);

      await Transaction.create({
        studentRollNo: request.studentRollNo,
        amount: totalCredit, 
        type: 'Rebate',
        status: 'Completed',
        date: new Date()
      }, { transaction: t });
    }

    await t.commit();
    return request;

  } catch (error) {
    await t.rollback();
    throw error;
  }
};

/**
 * 6. Approve New Student Registration
 */
const approveStudent = async (rollNo) => {
  const student = await Student.findByPk(rollNo);
  if (!student) throw new Error('Student not found.');
  student.messCardStatus = 'Active';
  await student.save();
  return student;
};

/**
 * 7. Get Manager Dashboard Stats
 */
const getManagerDashboardStats = async () => {
  const [totalActiveStudents, pendingRebates, newRequests, activePolls] = await Promise.all([
    Student.count({ where: { messCardStatus: 'Active' } }),
    RebateRequest.count({ where: { status: 'Pending' } }),
    Student.count({ where: { messCardStatus: 'Suspended' } }),
    Menu.count().catch(() => 0)
  ]);
  
  return { totalActiveStudents, pendingRebates, newRequests, activePolls };
};

/**
 * 8. Feedback Analytics
 */
const getFeedbackAnalytics = async () => {
  return await Feedback.findAll({
    attributes: [
      'category',
      [sequelize.fn('COUNT', sequelize.col('feedbackId')), 'totalReviews'],
      [sequelize.fn('ROUND', sequelize.fn('AVG', sequelize.col('rating')), 1), 'averageRating']
    ],
    group: ['category'],
    order: [[sequelize.literal('"averageRating"'), 'DESC']]
  });
};

/**
 * 9. Initialize Database with Seed Data (Transactional)
 * Inserts all initial data in one go.
 */
const initializeDatabase = async (data) => {
  const t = await sequelize.transaction();
  try {
    if (data.managers) await MessManager.bulkCreate(data.managers, { transaction: t });
    if (data.students) await Student.bulkCreate(data.students, { transaction: t });
    if (data.menus) await Menu.bulkCreate(data.menus, { transaction: t });
    if (data.extras) await ExtraItem.bulkCreate(data.extras, { transaction: t });
    if (data.transactions) await Transaction.bulkCreate(data.transactions, { transaction: t });
    if (data.rebates) await RebateRequest.bulkCreate(data.rebates, { transaction: t });
    if (data.feedbacks) await Feedback.bulkCreate(data.feedbacks, { transaction: t });

    await t.commit();
    return { success: true, message: 'Database initialized successfully.' };
  } catch (error) {
    if (t) await t.rollback();
    throw error;
  }
};

module.exports = {
  buyExtraItem,
  getMonthlyBill,
  submitRebate,
  submitFeedback,
  processRebate,
  approveStudent,
  getManagerDashboardStats,
  getFeedbackAnalytics,
  initializeDatabase
};