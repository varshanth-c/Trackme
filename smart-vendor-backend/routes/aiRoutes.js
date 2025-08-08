const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const authMiddleware = require('../middleware/authMiddleware');

// Protect all AI-related routes
router.use(authMiddleware);

// Generate SQL from a question
router.post('/generate-sql', aiController.generateSql);

// Execute a generated SQL query
router.post('/execute-sql', aiController.executeQuery);

// Get user's query history
router.get('/history', aiController.getHistory);

module.exports = router;
