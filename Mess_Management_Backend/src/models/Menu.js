const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Menu = sequelize.define('Menu', {
    menuId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    mealType: {
        type: DataTypes.ENUM('Breakfast', 'Lunch', 'Dinner'),
        allowNull: false
    },
    items: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    voteCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
}, { timestamps: false });

module.exports = Menu;