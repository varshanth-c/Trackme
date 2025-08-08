const db = require('../config/db');

/**
 * @route   GET /api/users/profile
 * @desc    Get the profile of the currently authenticated user
 */
exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.user.userId; // This comes from the authMiddleware

    const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
    const userProfile = rows[0];

    if (!userProfile) {
      return res.status(404).json({ error: 'User profile not found.' });
    }

    // IMPORTANT: Never send the password hash to the client
    delete userProfile.password;

    res.json({ profile: userProfile });
  } catch (err) {
    console.error('Error fetching user profile:', err);
    res.status(500).json({ error: 'Failed to fetch user profile.' });
  }
};

/**
 * @route   PUT /api/users/profile
 * @desc    Update the profile of the currently authenticated user
 */
exports.updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Destructure all updatable fields from the request body
    const {
      full_name,
      role,
      specialty,
      phone_number,
      avatar_url,
      business_name,
      business_type,
      business_address,
      preferred_language,
    } = req.body;

    const query = `
      UPDATE users SET
        full_name = ?,
        role = ?,
        specialty = ?,
        phone_number = ?,
        avatar_url = ?,
        business_name = ?,
        business_type = ?,
        business_address = ?,
        preferred_language = ?
      WHERE id = ?
    `;

    const values = [
      full_name,
      role,
      specialty,
      phone_number,
      avatar_url,
      business_name,
      business_type,
      business_address,
      preferred_language,
      userId,
    ];

    const [result] = await db.query(query, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found or no changes made.' });
    }

    // Fetch the updated profile to send back to the client
    const [updatedRows] = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
    const updatedProfile = updatedRows[0];
    delete updatedProfile.password;

    res.json({ message: 'Profile updated successfully!', profile: updatedProfile });

  } catch (err) {
    console.error('Error updating user profile:', err);
    res.status(500).json({ error: 'Failed to update profile.' });
  }
};
