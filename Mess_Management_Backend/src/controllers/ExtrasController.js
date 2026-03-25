const { buyExtraItem } = require('../models/db_controller');
const ExtraItem = require('../models/ExtraItem');
const { authenticateToken, requireStudent } = require('./AuthController');

// Get all available extra items
const getExtraItems = async (req, res) => {
  try {
    const items = await ExtraItem.findAll({
      where: { isAvailable: true },
      attributes: ['itemId', 'itemName', 'price', 'stockQuantity'],
      order: [['itemName', 'ASC']]
    });

    // Transform data to match frontend expectations
    const transformedItems = items.map(item => ({
      id: item.itemId,
      name: item.itemName,
      price: item.price,
      category: 'Main Course', // Default category, could be enhanced later
      available: true, // Since we filter by isAvailable: true
      stock: item.stockQuantity
    }));

    res.status(200).json({
      success: true,
      data: transformedItems
    });
  } catch (error) {
    console.error('Error fetching extra items:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.'
    });
  }
};

// Buy an extra item
const buyExtraItemHandler = async (req, res) => {
  try {
    const rollNo = req.user.rollNo;
    const { extraItemId, quantityToBuy } = req.body;

    if (!extraItemId || !quantityToBuy || quantityToBuy <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid extraItemId and quantityToBuy are required.'
      });
    }

    const purchase = await buyExtraItem(rollNo, extraItemId, quantityToBuy);

    res.status(201).json({
      success: true,
      message: 'Extra item purchased successfully.',
      data: purchase
    });
  } catch (error) {
    console.error('Error buying extra item:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get student's extra buying history
const getExtraBuyingHistory = async (req, res) => {
  try {
    const rollNo = req.user.rollNo;
    const Transaction = require('../models/Transaction');

    const history = await Transaction.findAll({
      where: {
        studentRollNo: rollNo,
        type: 'Extra Item'
      },
      include: [{
        model: ExtraItem,
        attributes: ['itemName', 'price'],
        required: false
      }],
      order: [['date', 'DESC']],
      limit: 50
    });

    const formattedHistory = history.map(transaction => ({
      transactionId: transaction.transactionId,
      date: transaction.date,
      itemName: transaction.ExtraItem?.itemName || 'Unknown Item',
      quantity: Math.abs(transaction.amount) / (transaction.ExtraItem?.price || 1), // Approximate quantity
      totalCost: transaction.amount,
      status: transaction.status
    }));

    res.status(200).json({
      success: true,
      data: formattedHistory
    });
  } catch (error) {
    console.error('Error fetching extra buying history:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.'
    });
  }
};

// Get all extra buying history for manager
const getAllExtraBuyingHistory = async (req, res) => {
  try {
    const Transaction = require('../models/Transaction');
    const Student = require('../models/Student');

    // Get query parameters for filtering
    const { month, year } = req.query;
    let whereClause = { type: 'Extra Item' };

    // Add date filtering if month and year are provided
    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 1);
      whereClause.date = {
        [require('sequelize').Op.gte]: startDate,
        [require('sequelize').Op.lt]: endDate
      };
    }

    console.log('Query where clause:', whereClause);

    // First try without include to see if basic query works
    const transactionCount = await Transaction.count({ where: whereClause });
    console.log('Transaction count:', transactionCount);

    const history = await Transaction.findAll({
      where: whereClause,
      include: [{
        model: Student,
        as: 'student',
        attributes: ['name', 'rollNo'],
        required: true
      }],
      order: [['date', 'DESC']],
      limit: 1000
    });

    console.log('Found transactions:', history.length);

    // Group transactions by student and date for better frontend display
    const groupedHistory = history.reduce((acc, transaction) => {
      const studentId = transaction.student.rollNo;
      const date = transaction.date.toISOString().split('T')[0];
      const key = `${studentId}_${date}`;

      if (!acc[key]) {
        acc[key] = {
          id: key,
          studentId: transaction.student.rollNo,
          studentName: transaction.student.name,
          date: date,
          items: [],
          total: 0
        };
      }

      // Add item to the purchase (using itemName from transaction)
      if (transaction.itemName) {
        acc[key].items.push({
          name: transaction.itemName,
          quantity: 1,
          price: transaction.amount
        });
        acc[key].total += transaction.amount;
      }

      return acc;
    }, {});

    const formattedHistory = Object.values(groupedHistory);
    console.log('Formatted history count:', formattedHistory.length);

    res.status(200).json({
      success: true,
      data: formattedHistory
    });
  } catch (error) {
    console.error('Error fetching all extra buying history:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error: ' + error.message
    });
  }
};

module.exports = {
  getExtraItems,
  buyExtraItemHandler,
  getExtraBuyingHistory,
  getAllExtraBuyingHistory
};
