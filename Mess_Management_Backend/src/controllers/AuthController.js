const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Student = require('../models/Student');
const MessManager = require('../models/MessManager');

// JWT secret - in production, use environment variable
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Helper function to generate JWT token
const generateToken = (user, role) => {
  return jwt.sign(
    {
      rollNo: user.rollNo || user.adminId,
      role: role,
      name: user.name
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
};

// Register a new student
const registerStudent = async (req, res) => {
  try {
    const { rollNo, name, email, password, roomNo } = req.body;

    // Check if student already exists
    const existingStudent = await Student.findByPk(rollNo);
    if (existingStudent) {
      return res.status(400).json({
        success: false,
        message: 'Student with this roll number already exists.'
      });
    }

    // Check if email is already used
    const existingEmail = await Student.findOne({ where: { email } });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: 'Email is already registered.'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create student
    const student = await Student.create({
      rollNo,
      name,
      email,
      password: hashedPassword,
      roomNo,
      messCardStatus: 'Suspended' // New students need approval
    });

    // Generate token
    const token = generateToken(student, 'student');

    res.status(201).json({
      success: true,
      message: 'Student registered successfully. Please wait for mess manager approval.',
      data: {
        rollNo: student.rollNo,
        name: student.name,
        email: student.email,
        roomNo: student.roomNo,
        messCardStatus: student.messCardStatus,
        token
      }
    });
  } catch (error) {
    console.error('Error registering student:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.'
    });
  }
};

// Login for students
const loginStudent = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find student by email or roll number
    let student = await Student.findOne({ where: { email } });
    if (!student) {
      // Try to find by roll number if email not found
      student = await Student.findOne({ where: { rollNo: email } });
    }
    
    if (!student) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email/roll number or password.'
      });
    }

    // Check password (temporary: handle both hashed and plain text for development)
    let isValidPassword = false;
    if (student.password.startsWith('$2a$') || student.password.startsWith('$2b$') || student.password.startsWith('$2y$')) {
      // Password is hashed
      isValidPassword = await bcrypt.compare(password, student.password);
    } else {
      // Password is plain text (for development/testing)
      isValidPassword = password === student.password;
    }
    
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email/roll number or password.'
      });
    }

    // Check if student is active
    if (student.messCardStatus !== 'Active') {
      return res.status(403).json({
        success: false,
        message: 'Your account is not active. Please contact mess manager.'
      });
    }

    // Generate token
    const token = generateToken(student, 'student');

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: {
        rollNo: student.rollNo,
        name: student.name,
        email: student.email,
        roomNo: student.roomNo,
        messCardStatus: student.messCardStatus,
        token
      }
    });
  } catch (error) {
    console.error('Error logging in student:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.'
    });
  }
};

// Register a new mess manager
const registerManager = async (req, res) => {
  try {
    const { adminId, name, password, role = 'Manager' } = req.body;

    // Check if manager already exists
    const existingManager = await MessManager.findByPk(adminId);
    if (existingManager) {
      return res.status(400).json({
        success: false,
        message: 'Manager with this admin ID already exists.'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create manager
    const manager = await MessManager.create({
      adminId,
      name,
      password: hashedPassword,
      role
    });

    // Generate token
    const token = generateToken(manager, 'manager');

    res.status(201).json({
      success: true,
      message: 'Mess manager registered successfully.',
      data: {
        adminId: manager.adminId,
        name: manager.name,
        role: manager.role,
        token
      }
    });
  } catch (error) {
    console.error('Error registering manager:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.'
    });
  }
};

// Login for mess managers
const loginManager = async (req, res) => {
  try {
    let { adminId, password } = req.body;

    // Handle cases where user enters adminId with @domain (e.g., ADMIN01@iitk.ac.in)
    if (adminId && adminId.includes('@')) {
      adminId = adminId.split('@')[0];
    }

    // Find manager by adminId
    const manager = await MessManager.findByPk(adminId);
    if (!manager) {
      return res.status(401).json({
        success: false,
        message: 'Invalid admin ID or password.'
      });
    }

    // Check password (temporary: handle both hashed and plain text for development)
    let isValidPassword = false;
    if (manager.password.startsWith('$2a$') || manager.password.startsWith('$2b$') || manager.password.startsWith('$2y$')) {
      // Password is hashed
      isValidPassword = await bcrypt.compare(password, manager.password);
    } else {
      // Password is plain text (for development/testing)
      isValidPassword = password === manager.password;
    }
    
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid admin ID or password.'
      });
    }

    // Generate token
    const token = generateToken(manager, 'manager');

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: {
        adminId: manager.adminId,
        name: manager.name,
        role: manager.role,
        token
      }
    });
  } catch (error) {
    console.error('Error logging in manager:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.'
    });
  }
};

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token required.'
    });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: 'Invalid or expired token.'
      });
    }
    req.user = user;
    next();
  });
};

// Middleware to check if user is a student
const requireStudent = (req, res, next) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({
      success: false,
      message: 'Student access required.'
    });
  }
  next();
};

// Middleware to check if user is a manager
const requireManager = (req, res, next) => {
  if (req.user.role !== 'manager') {
    return res.status(403).json({
      success: false,
      message: 'Manager access required.'
    });
  }
  next();
};

module.exports = {
  registerStudent,
  loginStudent,
  registerManager,
  loginManager,
  authenticateToken,
  requireStudent,
  requireManager
};
