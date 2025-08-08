const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid'); // Import UUID generator
const { generateToken } = require('../utils/jwt');
const { sendVerificationEmail, sendResetPasswordEmail } = require('../utils/mailer');
const db = require('../config/db');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;

// ------------------ SIGNUP -------------------
router.post('/signup', async (req, res) => {
  // Destructure fields based on the new 'users' schema
  const {
    full_name,
    email,
    password,
    role, // 'role' is a required field in your new schema
    specialty,
    phone_number,
    avatar_url,
    business_name,
    business_type,
    business_address,
    preferred_language
  } = req.body;

  // Validate required fields
  if (!full_name || !email || !password || !role) {
    return res.status(400).json({ error: 'Missing required fields: full_name, email, password, and role are required.' });
  }

  // Optional: Validate the role
  if (!['admin', 'staff', 'vendor'].includes(role)) {
    return res.status(400).json({ error: "Invalid role. Must be 'admin', 'staff', or 'vendor'." });
  }

  try {
    // Check if user already exists
    const [existing] = await db.query('SELECT email FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'User with this email already exists' }); // 409 Conflict is more specific
    }
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Generate a new UUID for the user on the server
    const id = uuidv4();

    // The INSERT query now includes all the new columns
    const insertQuery = `
      INSERT INTO users (
        id, full_name, email, password, role, specialty, phone_number,
        avatar_url, business_name, business_type, business_address,
        preferred_language, verified
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      id,
      full_name,
      email,
      hashedPassword,
      role,
      specialty || null,
      phone_number || null,
      avatar_url || null,
      business_name || null,
      business_type || null,
      business_address || null,
      preferred_language || 'en', // Use default if not provided
      false // 'verified' defaults to false
    ];

    await db.query(insertQuery, values);

    // Send verification email
    const verificationToken = jwt.sign({ email }, JWT_SECRET, { expiresIn: '1h' });
    await sendVerificationEmail(email, verificationToken);

    return res.status(201).json({ 
        message: 'User created successfully. Please check your email to verify your account.',
        userId: id
    });

  } catch (err) {
    console.error('Signup Error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ------------------ EMAIL VERIFICATION (No changes needed) -------------------
router.get('/verify-email/:token', async (req, res) => {
  const { token } = req.params;

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const { email } = decoded;

    const [rows] = await db.query('SELECT verified FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
        return res.status(404).send('User not found.');
    }

    if (rows[0].verified) {
      return res.send('Email has already been verified.');
    }

    await db.query('UPDATE users SET verified = ? WHERE email = ?', [true, email]);
    return res.send('Email verified successfully. You can now log in.');
  } catch (err) {
    console.error('Verification Error:', err);
    return res.status(400).send('Invalid or expired verification link.');
  }
});


// ------------------ LOGIN (No major changes needed) -------------------
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    // Select all user data to return upon successful login
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    const user = rows[0];

    if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.verified) {
        return res.status(403).json({ error: 'Account not verified. Please check your email.' });
    }
    
    // Create a payload for the token
    const payload = {
        userId: user.id,
        role: user.role,
        email: user.email
    };
    
    const token = generateToken(payload);

    // Don't send the hashed password back to the client
    delete user.password;

    return res.status(200).json({ 
        message: 'Login successful',
        token,
        user 
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ------------------ FORGOT & RESET PASSWORD (No changes needed) -------------------
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    const [rows] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
        // We send a generic message to prevent email enumeration
        return res.json({ message: 'If a user with that email exists, a password reset link has been sent.' });
    }
    const user = rows[0];
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '15m' });
    await sendResetPasswordEmail(email, token);
    res.json({ message: 'If a user with that email exists, a password reset link has been sent.' });
  } catch (err) {
    console.error('Forgot Password Error:', err);
    res.status(500).json({ error: 'Failed to send reset email' });
  }
});

router.post('/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  if (!password) {
      return res.status(400).json({ error: 'Password is required.' });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, decoded.userId]);
    res.json({ message: 'Password has been reset successfully.' });
  } catch (err) {
    console.error('Reset Password Error:', err);
    res.status(400).json({ error: 'Invalid or expired password reset link.' });
  }
});


module.exports = router;