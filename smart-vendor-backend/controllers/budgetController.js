const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');

/**
 * @route   POST /api/budgets
 * @desc    Set or update a budget for a category in a specific month
 */
exports.setBudget = async (req, res) => {
  try {
    const { user_id, category, amount, month } = req.body;

    // Validate required fields
    if (!user_id || !category || !amount || !month) {
      return res.status(400).json({ error: 'Missing required fields: user_id, category, amount, and month.' });
    }

    // This query will INSERT a new budget. If a budget for that user, category,
    // and month already exists, it will UPDATE the amount instead.
    // This relies on the UNIQUE KEY you added to the database.
    const query = `
      INSERT INTO budgets (id, user_id, category, amount, month)
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE amount = VALUES(amount)
    `;
    
    const id = uuidv4();
    const values = [id, user_id, category, amount, month];

    const [result] = await db.query(query, values);

    // If a new row was inserted, affectedRows is 1. If an existing row was updated, it's 2.
    if (result.affectedRows > 0) {
      res.status(201).json({ message: 'Budget set successfully.' });
    } else {
      res.status(500).json({ error: 'Failed to set budget.' });
    }

  } catch (err) {
    console.error('Error setting budget:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * @route   GET /api/budgets?user_id=...&month=...
 * @desc    Get all budgets for a user for a specific month
 */
exports.getBudgets = async (req, res) => {
  try {
    const { user_id, month } = req.query;

    if (!user_id || !month) {
      return res.status(400).json({ error: 'user_id and month query parameters are required.' });
    }

    const [budgets] = await db.query(
      'SELECT * FROM budgets WHERE user_id = ? AND month = ? ORDER BY category ASC',
      [user_id, month]
    );

    res.json({ budgets });

  } catch (err) {
    console.error('Error fetching budgets:', err);
    res.status(500).json({ error: 'Failed to fetch budgets' });
  }
};


/**
 * @route   DELETE /api/budgets/:id
 * @desc    Delete a specific budget entry
 */
exports.deleteBudget = async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id } = req.body; // Get user_id from body for security

    if (!user_id) {
      return res.status(400).json({ error: 'user_id is required in the request body for deletion.' });
    }

    const [result] = await db.query(
      'DELETE FROM budgets WHERE id = ? AND user_id = ?',
      [id, user_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Budget not found or user not authorized.' });
    }

    res.json({ message: 'Budget deleted successfully.' });

  } catch (err) {
    console.error('Error deleting budget:', err);
    res.status(500).json({ error: 'Failed to delete budget' });
  }
};