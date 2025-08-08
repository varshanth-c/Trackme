const express = require('express');
const router = express.Router();
const emailController = require('../controllers/emailController');
const authMiddleware = require('../middleware/authMiddleware');

// Protect all notification routes
router.use(authMiddleware);

// Route to send a budget alert
router.post('/send-budget-alert', emailController.sendBudgetAlert);

module.exports = router;