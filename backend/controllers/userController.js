const User = require('../models/User');
const Address = require('../models/Address');

// @GET /api/users  (admin)
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({ _id: { $ne: req.user._id } }).select('-password').sort({ createdAt: -1 });
    res.json({ success: true, users, total: users.length });
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

// @POST /api/users/admin/create (admin)
exports.createUser = async (req, res, next) => {
  try {
    const { name, email, password, phone, role } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ success: false, message: 'Email already registered' });
    const user = await User.create({ name, email, password, phone, role: role || 'customer' });
    res.status(201).json({ success: true, user });
  } catch (error) { next(error); }
};

// @PUT /api/users/admin/:id (admin)
exports.updateUser = async (req, res, next) => {
  try {
    const { name, email, phone, role } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    user.name = name || user.name;
    user.email = email || user.email;
    user.phone = phone || user.phone;
    user.role = role || user.role;
    await user.save();
    res.json({ success: true, user });
  } catch (error) { next(error); }
};

// @DELETE /api/users/admin/:id (admin)
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, message: 'User deleted successfully' });
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
