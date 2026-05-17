const User = require('../models/User');
const Address = require('../models/Address');

// @GET /api/users  (admin)
exports.getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const [users, total] = await Promise.all([
      User.find({ role: 'customer' }).select('-password').sort({ createdAt: -1 })
        .skip((page - 1) * limit).limit(Number(limit)),
      User.countDocuments({ role: 'customer' }),
    ]);
    res.json({ success: true, users, total });
  } catch (error) { next(error); }
};

// @PUT /api/users/:id/toggle  (admin)
exports.toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    user.isActive = !user.isActive;
    await user.save();
    res.json({ success: true, user });
  } catch (error) { next(error); }
};

// @GET /api/users/addresses
exports.getAddresses = async (req, res, next) => {
  try {
    const addresses = await Address.find({ user: req.user._id });
    res.json({ success: true, addresses });
  } catch (error) { next(error); }
};

// @POST /api/users/addresses
exports.addAddress = async (req, res, next) => {
  try {
    if (req.body.isDefault) {
      await Address.updateMany({ user: req.user._id }, { isDefault: false });
    }
    const address = await Address.create({ ...req.body, user: req.user._id });
    res.status(201).json({ success: true, address });
  } catch (error) { next(error); }
};

// @DELETE /api/users/addresses/:id
exports.deleteAddress = async (req, res, next) => {
  try {
    await Address.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json({ success: true, message: 'Address deleted' });
  } catch (error) { next(error); }
};

// @PUT /api/users/wishlist/:productId
exports.toggleWishlist = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const pid = req.params.productId;
    const idx = user.wishlist.indexOf(pid);
    if (idx > -1) user.wishlist.splice(idx, 1);
    else user.wishlist.push(pid);
    await user.save();
    res.json({ success: true, wishlist: user.wishlist });
  } catch (error) { next(error); }
};
