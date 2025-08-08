const express = require('express');
const router = express.Router();
// Assuming you have an auth middleware to get the authenticated user
// const authMiddleware = require('../middleware/authMiddleware'); 
const transactions = require('../controllers/transactionController');

// If you have authentication, you can apply it to all routes like this:
// router.use(authMiddleware);

// --- Corrected and RESTful Routes ---

/**
 * @route   POST /api/transactions
 * @desc    Add a new transaction
 */
router.post('/', transactions.addTransaction);

/**
 * @route   GET /api/transactions?user_id=...
 * @desc    Get all transactions for a user
 */
router.get('/', transactions.getUserTransactions); // Changed from /get and updated function name

/**
 * @route   PUT /api/transactions/:id
 * @desc    Update a specific transaction
 */
router.put('/:id', transactions.updateTransaction); // Changed to include :id parameter

/**
 * @route   DELETE /api/transactions/:id
 * @desc    Delete a specific transaction
 */
router.delete('/:id', transactions.deleteTransaction); // Changed to include :id parameter

module.exports = router;