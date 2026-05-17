const express = require('express');
const router = express.Router();
const { getCoupons, getAllCoupons, createCoupon, updateCoupon, deleteCoupon } = require('../controllers/couponController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', getCoupons);
router.use(protect);
router.get('/admin/all', adminOnly, getAllCoupons);
router.post('/admin', adminOnly, createCoupon);
router.put('/admin/:id', adminOnly, updateCoupon);
router.delete('/admin/:id', adminOnly, deleteCoupon);

module.exports = router;
