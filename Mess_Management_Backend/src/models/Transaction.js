const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Transaction = sequelize.define('Transaction', {
    transactionId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    studentRollNo: {
        type: DataTypes.STRING,
        allowNull: false,
        references: { model: 'Students', key: 'rollNo' }
    },
    itemName: {
        type: DataTypes.STRING,
        allowNull: true // True because Monthly Fees don't have an item name
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    type: {
        type: DataTypes.ENUM('Monthly Fee', 'Extra Item', 'Rebate'),
        allowNull: false
    },
    date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    status: {
        type: DataTypes.ENUM('Pending', 'Completed', 'Failed'),
        defaultValue: 'Completed'
    }
});

module.exports = Transaction;