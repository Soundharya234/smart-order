const express = require('express');
const router = express.Router();
const { getAllUsers, toggleUserStatus, getAddresses, addAddress, deleteAddress, toggleWishlist, createUser, updateUser, deleteUser } = require('../controllers/userController');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect);
router.get('/addresses', getAddresses);
router.post('/addresses', addAddress);
router.delete('/addresses/:id', deleteAddress);
router.put('/wishlist/:productId', toggleWishlist);

// Admin
router.get('/admin/all', adminOnly, getAllUsers);
router.put('/admin/:id/toggle', adminOnly, toggleUserStatus);
router.post('/admin/create', adminOnly, createUser);
router.put('/admin/:id', adminOnly, updateUser);
router.delete('/admin/:id', adminOnly, deleteUser);

module.exports = router;
