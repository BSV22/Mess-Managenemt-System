const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Vote = sequelize.define('Vote', {
    voteId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    studentRollNo: {
        type: DataTypes.STRING,
        allowNull: false,
        references: { model: 'Students', key: 'rollNo' }
    },
    menuId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'Menus', key: 'menuId' }
    },
    voteType: {
        type: DataTypes.ENUM('up', 'down'),
        allowNull: false
    }
}, { timestamps: true });

// Prevent duplicate votes (one vote per student per menu)
Vote.addHook('beforeCreate', async (vote, options) => {
  const existingVote = await Vote.findOne({
    where: {
      studentRollNo: vote.studentRollNo,
      menuId: vote.menuId
    }
  });

  if (existingVote) {
    throw new Error('Student has already voted on this menu item.');
  }
});

module.exports = Vote;