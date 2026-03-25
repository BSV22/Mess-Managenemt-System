const express = require('express');
const sequelize = require('./config/db'); // Points to your database connection
const Student = require('./models/Student');
const Menu = require('./models/Menu');
const Transaction = require('./models/Transaction');
const Feedback = require('./models/Feedback');
const MessManager = require('./models/MessManager');
const Rebate = require('./models/Rebate');
const ExtraItem = require('./models/ExtraItem');
const Vote = require('./models/Vote');
const db_controller = require('./models/db_controller');

// Import all controllers
const {
  registerStudent,
  loginStudent,
  registerManager,
  loginManager,
  authenticateToken,
  requireStudent,
  requireManager
} = require('./controllers/AuthController');

const {
  getExtraItems,
  buyExtraItemHandler,
  getExtraBuyingHistory,
  getAllExtraBuyingHistory
} = require('./controllers/ExtrasController');

const {
  submitFeedbackHandler,
  getAllFeedbackHandler,
  getFeedbackAnalyticsHandler,
  getStudentFeedbackHandler
} = require('./controllers/FeedbackController');

const {
  getTodaysMenu,
  getMenuByDate,
  updateMenu,
  getAllMenus,
  deleteMenu
} = require('./controllers/MenuController');

const {
  submitRebateRequest,
  getStudentRebates,
  getAllRebates,
  processRebateRequest
} = require('./controllers/RebateController');

const {
  getStudentProfile,
  getStudentBill,
  getTransactionHistory,
  updateStudentProfile,
  getAllStudents,
  getPendingStudents
} = require('./controllers/StudentController');

const {
  submitVote,
  getVotingResults,
  getStudentVotes,
  checkVoteStatus
} = require('./controllers/VotingController');

const cors = require('cors');

const app = express();
const PORT = 3000; // Keeping the repo's original port

app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Allows the server to read JSON data

// Set up associations
Student.hasMany(Transaction, { foreignKey: 'studentRollNo', as: 'transactions' });
Student.hasMany(Feedback, { foreignKey: 'studentRollNo', as: 'feedbacks' });
Student.hasMany(Rebate, { foreignKey: 'studentRollNo', as: 'rebates' });
Student.hasMany(Vote, { foreignKey: 'studentRollNo', as: 'votes' });

Menu.hasMany(Vote, { foreignKey: 'menuId', as: 'votes' });

Feedback.belongsTo(Student, { foreignKey: 'studentRollNo', as: 'student' });

Rebate.belongsTo(Student, { foreignKey: 'studentRollNo', as: 'student' });

Transaction.belongsTo(Student, { foreignKey: 'studentRollNo', as: 'student' });

Vote.belongsTo(Student, { foreignKey: 'studentRollNo', as: 'student' });
Vote.belongsTo(Menu, { foreignKey: 'menuId', as: 'menu' });

// 1. Test Route (Keep this)
app.get('/', (req, res) => {
  res.send('Mess Automation Backend is Running and Connected!');
});

// ──────────────────────────────────────────
// Authentication Routes
// ──────────────────────────────────────────

// Student registration
app.post('/api/auth/student/register', registerStudent);

// Student login
app.post('/api/auth/student/login', loginStudent);

// Manager registration
app.post('/api/auth/manager/register', registerManager);

// Manager login
app.post('/api/auth/manager/login', loginManager);

// ──────────────────────────────────────────
// Student Routes (Protected)
// ──────────────────────────────────────────

// Get student profile
app.get('/api/student/profile', authenticateToken, getStudentProfile);

// Update student profile
app.put('/api/student/profile', authenticateToken, requireStudent, updateStudentProfile);

// Get student's monthly bill
app.get('/api/student/bill', authenticateToken, getStudentBill);

// Get student's transaction history
app.get('/api/student/transactions', authenticateToken, getTransactionHistory);

// Submit rebate request
app.post('/api/student/rebate', authenticateToken, submitRebateRequest);

// Get student's rebate requests
app.get('/api/student/rebates', authenticateToken, getStudentRebates);

// Submit feedback
app.post('/api/student/feedback', authenticateToken, submitFeedbackHandler);

// Get feedback
app.get('/api/student/feedback', authenticateToken, getStudentFeedbackHandler);

// Get available extra items
app.get('/api/student/extras', authenticateToken, getExtraItems);

// Buy extra item
app.post('/api/student/extras/buy', authenticateToken, buyExtraItemHandler);

// Get extra buying history
app.get('/api/student/extras/history', authenticateToken, getExtraBuyingHistory);

// Get today's menu
app.get('/api/student/menu/today', authenticateToken, getTodaysMenu);

// Get menu by date
app.get('/api/student/menu/:date', authenticateToken, getMenuByDate);

// Submit vote for menu
app.post('/api/student/vote', authenticateToken, submitVote);

// Get student's votes
app.get('/api/student/votes', authenticateToken, getStudentVotes);

// Check if student has voted on a menu
app.get('/api/student/vote/status/:menuId', authenticateToken, checkVoteStatus);

// Global settings
app.get('/api/settings', (req, res) => {
  res.json({ success: true, data: { bdmrValue: 150, monthlyCharge: 4500 } });
});

// ──────────────────────────────────────────
// Manager Routes (Protected)
// ──────────────────────────────────────────

// Get manager dashboard stats
app.get('/api/manager/dashboard', authenticateToken, requireManager, async (req, res) => {
  try {
    const stats = await db_controller.getManagerDashboardStats();
    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all students
app.get('/api/manager/students', authenticateToken, requireManager, getAllStudents);

// Get pending student registrations
app.get('/api/manager/students/pending', authenticateToken, requireManager, getPendingStudents);

// Approve student registration
app.patch('/api/manager/student/approve', authenticateToken, requireManager, async (req, res) => {
  try {
    const { rollNo } = req.body;
    const student = await db_controller.approveStudent(rollNo);
    res.status(200).json({ success: true, data: student });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});

// Get all rebate requests
app.get('/api/manager/rebates', authenticateToken, requireManager, getAllRebates);

// Process rebate request
app.patch('/api/manager/rebate/:requestId', authenticateToken, requireManager, processRebateRequest);

// Get all feedbacks
app.get('/api/manager/feedback', authenticateToken, requireManager, getAllFeedbackHandler);

// Get feedback analytics
app.get('/api/manager/feedback/analytics', authenticateToken, requireManager, getFeedbackAnalyticsHandler);

// Get all extra buying history for manager
app.get('/api/manager/extras/history', authenticateToken, requireManager, getAllExtraBuyingHistory);

// Get extra items
app.get('/api/manager/extras', authenticateToken, requireManager, getExtraItems);

// Menu management
app.get('/api/manager/menus', authenticateToken, requireManager, getAllMenus);
app.post('/api/manager/menu', authenticateToken, requireManager, updateMenu);
app.delete('/api/manager/menu/:date/:mealType', authenticateToken, requireManager, deleteMenu);

// Get voting results
app.get('/api/manager/votes/:date', authenticateToken, requireManager, getVotingResults);

// 2. Database Connection and Sync
// This creates the tables in your PostgreSQL (Port 5432)
sequelize.sync({ alter: true })
  .then(() => {
    console.log('Database synced successfully on port 5432');
    // Start the server only after the DB is ready
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to sync database:', err);
  });