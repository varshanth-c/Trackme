const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

// Protect all profile-related routes with authentication
router.use(authMiddleware);

// Route to get the user's own profile
router.get('/profile', userController.getUserProfile);

// Route to update the user's own profile
router.put('/profile', userController.updateUserProfile);

module.exports = router;