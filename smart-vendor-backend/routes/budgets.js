const express = require('express');
const router = express.Router();
const budgets = require('../controllers/budgetController');
const authMiddleware = require('../middleware/authMiddleware');

// Protect all budget routes with authentication
router.use(authMiddleware);

// Set or Update a budget for a category/month
router.post('/', budgets.setBudget);

// Get all budgets for a given user and month
router.get('/', budgets.getBudgets);

// Delete a specific budget entry by its ID
router.delete('/:id', budgets.deleteBudget);


module.exports = router;