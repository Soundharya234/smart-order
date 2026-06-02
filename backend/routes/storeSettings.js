const express = require('express');
const router = express.Router();
const { getStoreSettings, toggleStoreAvailability } = require('../controllers/storeSettingsController');
const { protect, adminOnly } = require('../middleware/auth');

// Public — anyone can check if the store is open
router.get('/', getStoreSettings);

// Admin only — toggle open/closed
router.put('/toggle', protect, adminOnly, toggleStoreAvailability);

module.exports = router;
