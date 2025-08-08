// Import the database connection pool
const db = require('../config/db'); // This should be a mysql2/promise pool

// Import the uuid library to generate unique IDs
const { v4: uuidv4 } = require('uuid');

/**
 * @route   POST /api/transactions
 * @desc    Add a new transaction
 */
exports.addTransaction = async (req, res) => {
  try {
    // Destructure new fields from the request body based on the new schema
    const {
      user_id,
      amount,
      date,
      description,
      category,
      type,
      subcategory,
      notes,
      receipt_photo_url
    } = req.body;

    // Validate required fields
    const requiredFields = { user_id, amount, date, category, type };
    const missingFields = Object.entries(requiredFields)
      .filter(([_, value]) => value === undefined || value === null || value === '')
      .map(([key]) => key);

    if (missingFields.length > 0) {
      return res.status(400).json({
        error: 'Missing required fields',
        missing: missingFields
      });
    }

    // Generate a new UUID for the transaction ID
    const id = uuidv4();

    const query = `
      INSERT INTO transactions (
        id, user_id, amount, date, description, category, type,
        subcategory, notes, receipt_photo_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      id,
      user_id,
      amount,
      date,
      description || '',
      category,
      type,
      subcategory || null, // Default optional fields to NULL
      notes || null,
      receipt_photo_url || null
    ];

    await db.query(query, values);
    res.status(201).json({ message: 'Transaction added successfully', id });

  } catch (err) {
    console.error('Error adding transaction:', err);
    // Check for foreign key constraint errors
    if (err.code === 'ER_NO_REFERENCED_ROW_2') {
        return res.status(404).json({ error: 'User not found. Cannot add transaction.' });
    }
    res.status(500).json({ error: 'Failed to add transaction' });
  }
};

/**
 * @route   GET /api/transactions?user_id=...
 * @desc    Get all transactions for a specific user
 */
exports.getUserTransactions = async (req, res) => {
  try {
    const { user_id } = req.query;

    if (!user_id) {
      return res.status(400).json({ error: 'user_id query parameter is required' });
    }

    const [results] = await db.query(
      'SELECT * FROM transactions WHERE user_id = ? ORDER BY date DESC, created_at DESC',
      [user_id]
    );

    res.json({ transactions: results });
  } catch (err) {
    console.error('Error fetching transactions:', err);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
};

/**
 * @route   PUT /api/transactions/:id
 * @desc    Update an existing transaction
 */
exports.updateTransaction = async (req, res) => {
  try {
    const { id } = req.params; // Get transaction ID from URL parameter
    const {
      user_id, // user_id is required for WHERE clause to ensure ownership
      amount,
      date,
      description,
      category,
      type,
      subcategory,
      notes,
      receipt_photo_url
    } = req.body;

    // user_id is crucial for security
    if (!user_id) {
        return res.status(400).json({ error: 'user_id is required in the request body' });
    }

    const query = `
      UPDATE transactions SET
        amount = ?, date = ?, description = ?, category = ?, type = ?,
        subcategory = ?, notes = ?, receipt_photo_url = ?
      WHERE id = ? AND user_id = ?
    `;

    const values = [
      amount,
      date,
      description || '',
      category,
      type,
      subcategory || null,
      notes || null,
      receipt_photo_url || null,
      id,
      user_id // Ensures a user can only update their own transaction
    ];

    const [result] = await db.query(query, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Transaction not found or user not authorized' });
    }

    res.json({ message: 'Transaction updated successfully' });
  } catch (err) {
    console.error('Error updating transaction:', err);
    res.status(500).json({ error: 'Failed to update transaction' });
  }
};

/**
 * @route   DELETE /api/transactions/:id
 * @desc    Delete a transaction
 */
exports.deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params; // Get transaction ID from URL parameter
    const { user_id } = req.body; // Get user_id from the body to confirm ownership

    if (!user_id) {
        return res.status(400).json({ error: 'user_id is required in the request body for deletion' });
    }

    const [result] = await db.query(
      'DELETE FROM transactions WHERE id = ? AND user_id = ?',
      [id, user_id] // Secure deletion by checking both id and user_id
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Transaction not found or user not authorized' });
    }

    res.json({ message: 'Transaction deleted successfully' });
  } catch (err) {
    console.error('Error deleting transaction:', err);
    res.status(500).json({ error: 'Failed to delete transaction' });
  }
};