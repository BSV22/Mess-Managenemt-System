const Menu = require('../models/Menu');
const { authenticateToken, requireManager } = require('./AuthController');

// Get today's menu
const getTodaysMenu = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

    const menu = await Menu.findAll({
      where: { date: today },
      order: [['mealType', 'ASC']]
    });

    // Group by meal type
    const groupedMenu = {
      breakfast: menu.find(m => m.mealType === 'Breakfast')?.items?.split(',') || [],
      lunch: menu.find(m => m.mealType === 'Lunch')?.items?.split(',') || [],
      dinner: menu.find(m => m.mealType === 'Dinner')?.items?.split(',') || []
    };

    res.status(200).json({
      success: true,
      data: groupedMenu
    });
  } catch (error) {
    console.error('Error fetching today\'s menu:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.'
    });
  }
};

// Get menu for a specific date
const getMenuByDate = async (req, res) => {
  try {
    const { date } = req.params;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date parameter is required.'
      });
    }

    const menu = await Menu.findAll({
      where: { date },
      order: [['mealType', 'ASC']]
    });

    const groupedMenu = {
      breakfast: menu.find(m => m.mealType === 'Breakfast')?.items?.split(',') || [],
      lunch: menu.find(m => m.mealType === 'Lunch')?.items?.split(',') || [],
      dinner: menu.find(m => m.mealType === 'Dinner')?.items?.split(',') || []
    };

    res.status(200).json({
      success: true,
      data: groupedMenu
    });
  } catch (error) {
    console.error('Error fetching menu by date:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.'
    });
  }
};

// Add or update menu for a specific date and meal type
const updateMenu = async (req, res) => {
  try {
    const { date, mealType, items } = req.body;

    if (!date || !mealType || !items) {
      return res.status(400).json({
        success: false,
        message: 'Date, mealType, and items are required.'
      });
    }

    if (!['Breakfast', 'Lunch', 'Dinner'].includes(mealType)) {
      return res.status(400).json({
        success: false,
        message: 'mealType must be Breakfast, Lunch, or Dinner.'
      });
    }

    // Check if menu entry exists
    let menuEntry = await Menu.findOne({
      where: { date, mealType }
    });

    const itemsString = Array.isArray(items) ? items.join(',') : items;

    if (menuEntry) {
      // Update existing
      menuEntry.items = itemsString;
      await menuEntry.save();
    } else {
      // Create new
      menuEntry = await Menu.create({
        date,
        mealType,
        items: itemsString,
        voteCount: 0
      });
    }

    res.status(200).json({
      success: true,
      message: 'Menu updated successfully.',
      data: menuEntry
    });
  } catch (error) {
    console.error('Error updating menu:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.'
    });
  }
};

// Get all menu entries (for manager)
const getAllMenus = async (req, res) => {
  try {
    const menus = await Menu.findAll({
      order: [['date', 'DESC'], ['mealType', 'ASC']],
      limit: 100
    });

    res.status(200).json({
      success: true,
      data: menus
    });
  } catch (error) {
    console.error('Error fetching all menus:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.'
    });
  }
};

// Delete menu entry
const deleteMenu = async (req, res) => {
  try {
    const { date, mealType } = req.params;

    if (!date || !mealType) {
      return res.status(400).json({
        success: false,
        message: 'Date and mealType parameters are required.'
      });
    }

    const deletedCount = await Menu.destroy({
      where: { date, mealType }
    });

    if (deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Menu entry not found.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Menu entry deleted successfully.'
    });
  } catch (error) {
    console.error('Error deleting menu:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.'
    });
  }
};

module.exports = {
  getTodaysMenu,
  getMenuByDate,
  updateMenu,
  getAllMenus,
  deleteMenu
};
