const sequelize = require('./config/db');
const { initializeDatabase } = require('./models/db_controller');

const seedData = async () => {
  try {
    await sequelize.sync({ force: true }); 
    console.log('⏳ Database synced. Starting initialization...');

    const data = {
      managers: [
        { adminId: 'ADMIN01', name: 'Ujjwal Kajal', password: 'hashedpassword', role: 'Admin' },
        { adminId: 'ADMIN02', name: 'Priya Sharma', password: 'hashedpassword', role: 'Manager' }
      ],
      students: [
        { rollNo: '240252', name: 'B Mahath', email: 'bmahath24@iitk.ac.in', password: 'pwd', roomNo: 'A-101', messCardStatus: 'Active' },
        { rollNo: '240804', name: 'Priyanshi Meena', email: 'priyanshim24@iitk.ac.in', password: 'pwd', roomNo: 'B-205', messCardStatus: 'Active' },
        { rollNo: '240484', name: 'Rishith Jalagam', email: 'rishithjs24@iitk.ac.in', password: 'pwd', roomNo: 'C-301', messCardStatus: 'Suspended' },
        { rollNo: '240156', name: 'Arjun Kumar', email: 'arjunk24@iitk.ac.in', password: 'pwd', roomNo: 'A-102', messCardStatus: 'Active' },
        { rollNo: '240289', name: 'Sneha Patel', email: 'snehap24@iitk.ac.in', password: 'pwd', roomNo: 'B-103', messCardStatus: 'Active' },
        { rollNo: '240367', name: 'Rahul Singh', email: 'rahuls24@iitk.ac.in', password: 'pwd', roomNo: 'C-204', messCardStatus: 'Active' },
        { rollNo: '240498', name: 'Kavya Reddy', email: 'kavyar24@iitk.ac.in', password: 'pwd', roomNo: 'A-305', messCardStatus: 'Active' },
        { rollNo: '240512', name: 'Vikram Joshi', email: 'vikramj24@iitk.ac.in', password: 'pwd', roomNo: 'B-401', messCardStatus: 'Active' },
        { rollNo: '240623', name: 'Ananya Gupta', email: 'ananyag24@iitk.ac.in', password: 'pwd', roomNo: 'C-502', messCardStatus: 'Active' },
        { rollNo: '240734', name: 'Mohit Verma', email: 'mohitv24@iitk.ac.in', password: 'pwd', roomNo: 'A-603', messCardStatus: 'Active' },
        { rollNo: '240845', name: 'Divya Nair', email: 'divyan24@iitk.ac.in', password: 'pwd', roomNo: 'B-704', messCardStatus: 'Active' },
        { rollNo: '240956', name: 'Siddharth Rao', email: 'siddharthr24@iitk.ac.in', password: 'pwd', roomNo: 'C-805', messCardStatus: 'Active' }
      ],
      menus: [
        { date: '2026-03-20', mealType: 'Breakfast', items: 'Poha, Sambar, Idli (4 pcs), Tea/Coffee', voteCount: 45 },
        { date: '2026-03-20', mealType: 'Lunch', items: 'Rice, Dal Tadka, Mixed Vegetable, Raita, Chapati', voteCount: 67 },
        { date: '2026-03-20', mealType: 'Dinner', items: 'Roti, Rice, Rajma Masala, Aloo Gobi', voteCount: 89 },
        { date: '2026-03-21', mealType: 'Breakfast', items: 'Aloo Paratha, Curd, Pickle, Tea/Coffee', voteCount: 52 },
        { date: '2026-03-21', mealType: 'Lunch', items: 'Rice, Chana Masala, Bhindi, Salad, Chapati', voteCount: 71 },
        { date: '2026-03-21', mealType: 'Dinner', items: 'Roti, Rice, Paneer Butter Masala, Jeera Rice', voteCount: 83 },
        { date: '2026-03-22', mealType: 'Breakfast', items: 'Dosa, Sambar, Coconut Chutney, Tea/Coffee', voteCount: 48 },
        { date: '2026-03-22', mealType: 'Lunch', items: 'Rice, Dal Makhani, Cauliflower, Raita, Chapati', voteCount: 69 },
        { date: '2026-03-22', mealType: 'Dinner', items: 'Roti, Rice, Chicken Curry, Mixed Vegetable', voteCount: 76 }
      ],
      extras: [
        { itemName: 'Paneer Curry', price: 50.00, stockQuantity: 20, isAvailable: true },
        { itemName: 'Ice Cream', price: 30.00, stockQuantity: 50, isAvailable: true },
        { itemName: 'Cold Drink', price: 25.00, stockQuantity: 100, isAvailable: true },
        { itemName: 'Fresh Juice', price: 40.00, stockQuantity: 30, isAvailable: true },
        { itemName: 'Chips', price: 20.00, stockQuantity: 80, isAvailable: true },
        { itemName: 'Fruit Bowl', price: 60.00, stockQuantity: 15, isAvailable: true },
        { itemName: 'Sandwich', price: 45.00, stockQuantity: 25, isAvailable: true },
        { itemName: 'Pizza Slice', price: 70.00, stockQuantity: 12, isAvailable: true },
        { itemName: 'Burger', price: 65.00, stockQuantity: 18, isAvailable: true },
        { itemName: 'Pasta', price: 55.00, stockQuantity: 22, isAvailable: true }
      ],
      transactions: [
        { studentRollNo: '240252', itemName: null, amount: 4500.00, type: 'Monthly Fee', status: 'Completed', date: '2026-03-01' },
        { studentRollNo: '240804', itemName: null, amount: 4500.00, type: 'Monthly Fee', status: 'Completed', date: '2026-03-01' },
        { studentRollNo: '240156', itemName: null, amount: 4500.00, type: 'Monthly Fee', status: 'Completed', date: '2026-03-01' },
        { studentRollNo: '240289', itemName: null, amount: 4500.00, type: 'Monthly Fee', status: 'Completed', date: '2026-03-01' },
        { studentRollNo: '240484', itemName: null, amount: -1500.00, type: 'Rebate', status: 'Completed', date: '2026-03-25' }
      ],
      rebates: [
        { studentRollNo: '240484', startDate: '2026-03-25', endDate: '2026-03-30', reason: 'Going home for family function', status: 'Approved' },
        { studentRollNo: '240156', startDate: '2026-03-28', endDate: '2026-04-02', reason: 'Medical checkup in hometown', status: 'Pending' }
      ],
      feedbacks: [
        { studentRollNo: '240252', rating: 4, category: 'Food Quality', comment: 'Paneer was great but dal could be better spiced.' },
        { studentRollNo: '240804', rating: 5, category: 'Service', comment: 'Very fast service today.' }
      ]
    };

    const result = await initializeDatabase(data);
    console.log(`✅ ${result.message}`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedData();