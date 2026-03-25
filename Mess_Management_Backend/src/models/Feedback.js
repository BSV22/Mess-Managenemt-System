const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Feedback = sequelize.define('Feedback', {
    feedbackId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    studentRollNo: {
        type: DataTypes.STRING,
        allowNull: false,
        references: { model: 'Students', key: 'rollNo' }
    },
    rating: {
        type: DataTypes.INTEGER,
        validate: { min: 1, max: 5 },
        allowNull: false
    },
    comment: {
        type: DataTypes.TEXT
    },
      category: {
        type: DataTypes.ENUM('Food Quality', 'Cleanliness', 'Service', 'Variety', 'General'),
        defaultValue: 'General'
    }
}, { timestamps: true });

module.exports = Feedback;