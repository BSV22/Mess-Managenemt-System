const { submitFeedback, getFeedbackAnalytics } = require('../models/db_controller');
const Student = require('../models/Student');
const Feedback = require('../models/Feedback');

// Maps frontend kebab-case categories → DB ENUM values
const CATEGORY_MAP = {
  'food-quality': 'Food Quality',
  'cleanliness':  'Cleanliness',
  'service':      'Service',
  'variety':      'Variety',
  'general':      'General'
};

// Maps DB ENUM values → frontend kebab-case
const CATEGORY_REVERSE_MAP = {
  'Food Quality': 'food-quality',
  'Cleanliness':  'cleanliness',
  'Service':      'service',
  'Variety':      'variety',
  'General':      'general'
};

// Shapes a raw DB feedback row into the frontend type
const formatFeedback = (row, studentName = '') => ({
  id:          String(row.feedbackId),
  studentId:   row.studentRollNo,
  studentName: studentName,
  date:        row.createdAt,
  rating:      row.rating,
  category:    CATEGORY_REVERSE_MAP[row.category] || 'general',
  message:     row.comment || ''
});

/**
 * POST /api/feedback
 * Body: { rating, category, message }
 * Auth: Student (rollNo from JWT)
 */
const submitFeedbackHandler = async (req, res) => {
  try {
    let rollNo = req.user?.rollNo;
    const { rating, category, message } = req.body || {};

    // Support non-auth Postman tests by allowing body rollNo fallback.
    if (!rollNo) {
      rollNo = req.body?.rollNo;
    }

    if (!rollNo) {
      return res.status(401).json({ success: false, message: 'Student rollNo is required in auth token or request body.' });
    }

    // --- Validation ---
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5.' });
    }

    const dbCategory = CATEGORY_MAP[category];
    if (category && !dbCategory) {
      return res.status(400).json({
        success: false,
        message: `Invalid category. Must be one of: ${Object.keys(CATEGORY_MAP).join(', ')}.`
      });
    }

    // submitFeedback(rollNo, rating, category, comment)
    const raw = await submitFeedback(rollNo, rating, dbCategory, message);

    // Fetch student name for the response shape
    const student = await Student.findByPk(rollNo, { attributes: ['name'] });

    return res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully.',
      data: formatFeedback(raw, student?.name || '')
    });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

/**
 * GET /api/feedback
 * Returns all feedback in the frontend shape (with student names).
 * Auth: Manager only
 */
const getAllFeedbackHandler = async (req, res) => {
  try {
    const rows = await Feedback.findAll({
      include: [{ model: Student, attributes: ['name'], as: 'student' }],
      order: [['createdAt', 'DESC']]
    });

    const data = rows.map(row =>
      formatFeedback(row, row.student?.name || '')
    );

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Error fetching feedback:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

/**
 * GET /api/feedback/analytics
 * Grouped by category with average ratings.
 * Auth: Manager only
 */
const getFeedbackAnalyticsHandler = async (req, res) => {
  try {
    const raw = await getFeedbackAnalytics();

    // Also convert category keys in analytics to kebab-case for consistency
    const data = raw.map(row => ({
      category:      CATEGORY_REVERSE_MAP[row.dataValues.category] || row.dataValues.category,
      totalReviews:  row.dataValues.totalReviews,
      averageRating: row.dataValues.averageRating
    }));

    return res.status(200).json({
      success: true,
      message: 'Feedback analytics fetched successfully.',
      data
    });
  } catch (error) {
    console.error('Error fetching feedback analytics:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

/**
 * GET /api/student/feedback
 * Returns feedback for the logged in student.
 * Auth: Student
 */
const getStudentFeedbackHandler = async (req, res) => {
  try {
    const rollNo = req.user?.rollNo;
    if (!rollNo) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const rows = await Feedback.findAll({
      where: { studentRollNo: rollNo },
      order: [['createdAt', 'DESC']]
    });

    const student = await Student.findByPk(rollNo, { attributes: ['name'] });
    const data = rows.map(row => formatFeedback(row, student?.name || ''));

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Error fetching student feedback:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

module.exports = {
  submitFeedbackHandler,
  getAllFeedbackHandler,
  getFeedbackAnalyticsHandler,
  getStudentFeedbackHandler
};