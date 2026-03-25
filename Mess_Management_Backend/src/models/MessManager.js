const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const MessManager = sequelize.define('MessManager', {
    adminId: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    role: {
        type: DataTypes.ENUM('Manager', 'Staff', 'Admin'),
        defaultValue: 'Manager'
    }
}, { timestamps: true });

module.exports = MessManager;