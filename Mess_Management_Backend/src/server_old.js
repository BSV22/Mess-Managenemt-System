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
  getExtraBuyingHistory
} = require('./controllers/ExtrasController');

const {
  submitFeedbackHandler,
  getAllFeedbackHandler,
  getFeedbackAnalyticsHandler
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

const app = express();
const PORT = 3000; // Keeping the repo's original port

app.use(express.json()); // Allows the server to read JSON data

// 1. Test Route (Keep this)
app.get('/', (req, res) => {
  res.send('Mess Automation Backend is Running and Connected!');
});
 
// Buy an extra item
// POST /api/extras/buy  { rollNo, extraItemId, quantityToBuy }
app.post('/api/extras/buy', async (req, res) => {
  try {
    const { rollNo, extraItemId, quantityToBuy } = req.body;
    const purchase = await db_controller.buyExtraItem(rollNo, extraItemId, quantityToBuy);
    res.status(201).json({ success: true, data: purchase });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});
 
// Get monthly bill for a student
// GET /api/student/:rollNo/bill
app.get('/api/student/:rollNo/bill', async (req, res) => {
  try {
    const { rollNo } = req.params;
    const bill = await db_controller.getMonthlyBill(rollNo);
    res.status(200).json({ success: true, data: { totalBill: bill } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
 
// Submit a rebate request
// POST /api/rebate  { rollNo, startDate, endDate, reason }
app.post('/api/rebate', async (req, res) => {
  try {
    const { rollNo, startDate, endDate, reason } = req.body;
    const rebate = await db_controller.submitRebate(rollNo, startDate, endDate, reason);
    res.status(201).json({ success: true, data: rebate });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});
 
// Submit feedback
// POST /api/feedback  { rating, category, message }
app.post('/api/feedback', submitFeedbackHandler);
// ──────────────────────────────────────────
// Manager Routes
// ──────────────────────────────────────────
 
// Process (approve/reject) a rebate request
// PATCH /api/manager/rebate/:requestId  { decision, rebateAmountPerDay }
app.patch('/api/manager/rebate/:requestId', async (req, res) => {
  try {
    const { requestId } = req.params;
    const { decision, rebateAmountPerDay } = req.body;
 
    if (!['Approved', 'Rejected'].includes(decision)) {
      return res.status(400).json({ success: false, message: 'Decision must be Approved or Rejected.' });
    }
 
    const result = await db_controller.processRebate(requestId, decision, rebateAmountPerDay);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});
 
// Approve a new student registration
// PATCH /api/manager/student/approve  { rollNo }
app.patch('/api/manager/student/approve', async (req, res) => {
  try {
    const { rollNo } = req.body;
    const student = await db_controller.approveStudent(rollNo);
    res.status(200).json({ success: true, data: student });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});
 
// Get manager dashboard stats
// GET /api/manager/dashboard
app.get('/api/manager/dashboard', async (req, res) => {
  try {
    const stats = await db_controller.getManagerDashboardStats();
    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
 
// Get all feedbacks (manager)
// GET /api/manager/feedback
app.get('/api/manager/feedback', getAllFeedbackHandler);

// Get feedback analytics (manager)
// GET /api/manager/feedback/analytics
// app.get('/api/manager/feedback/analytics', getFeedbackAnalyticsHandler);
 

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