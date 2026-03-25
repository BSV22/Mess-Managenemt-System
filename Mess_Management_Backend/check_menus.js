const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize('postgres://postgres:1234@localhost:5432/MessAutomationDB', { logging: false });

const Menu = sequelize.define('Menu', {
  date: { type: DataTypes.DATEONLY, allowNull: false },
  mealType: { type: DataTypes.ENUM('Breakfast', 'Lunch', 'Dinner'), allowNull: false },
  items: { type: DataTypes.TEXT, allowNull: false },
  voteCount: { type: DataTypes.INTEGER, defaultValue: 0 }
}, {
  tableName: 'Menus',
  timestamps: false
});

async function check() {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // Check if menu exists for today
    const existing = await Menu.findAll({ where: { date: today } });
    if (existing.length === 0) {
      console.log('Inserting mock menu for today...');
      await Menu.bulkCreate([
        { date: today, mealType: 'Breakfast', items: 'Aloo Paratha, Curd, Tea' },
        { date: today, mealType: 'Lunch', items: 'Rice, Dal Makhani, Paneer Butter Masala, Roti' },
        { date: today, mealType: 'Dinner', items: 'Jeera Rice, Kadhai Chicken, Naan, Gulab Jamun' }
      ]);
      console.log('Mock menu inserted successfully.');
    } else {
      console.log('Menu already exists for today:', today);
    }
  } catch(e) { console.error(e); }
  process.exit(0);
}
check();
