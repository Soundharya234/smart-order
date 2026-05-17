const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Notification = require('../models/Notification');

// @POST /api/orders
exports.placeOrder = async (req, res, next) => {
  try {
    const { shippingAddress, paymentMethod, notes } = req.body;
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    if (!cart || cart.items.length === 0)
      return res.status(400).json({ success: false, message: 'Cart is empty' });

    const items = cart.items.map(i => ({
      product: i.product._id, name: i.name, image: i.image,
      price: i.price, quantity: i.quantity, unit: i.unit,
    }));

    const subtotal = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const deliveryFee = subtotal >= 299 ? 0 : 29;
    const discount = cart.discount || 0;
    const total = subtotal + deliveryFee - discount;

    // Reduce stock
    for (const item of cart.items) {
      await Product.findByIdAndUpdate(item.product._id, { $inc: { stock: -item.quantity } });
    }

    const order = await Order.create({
      user: req.user._id, items, shippingAddress, paymentMethod, notes,
      subtotal, deliveryFee, discount, total,
      statusHistory: [{ status: 'placed', note: 'Order placed successfully' }],
    });

    // Clear cart
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [], discount: 0, coupon: null });

    // Create notification
    await Notification.create({
      user: req.user._id, title: 'Order Placed!',
      message: `Your order #${order.orderId} has been placed successfully.`,
      type: 'order', data: { orderId: order._id },
    });

    res.status(201).json({ success: true, order });
  } catch (error) {
    console.error('placeOrder error:', error);
    res.status(error.statusCode || 500).json({ success: false, message: error.message || 'Server Error' });
  }
};

// @GET /api/orders/my
exports.getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (error) { next(error); }
};

// @GET /api/orders/:id
exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, order });
  } catch (error) { next(error); }
};

// @PUT /api/orders/:id/cancel
exports.cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (['delivered', 'cancelled'].includes(order.orderStatus))
      return res.status(400).json({ success: false, message: 'Cannot cancel this order' });

    order.orderStatus = 'cancelled';
    order.statusHistory.push({ status: 'cancelled', note: 'Cancelled by customer' });
    await order.save();
    res.json({ success: true, order });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};

// ADMIN: @GET /api/admin/orders
exports.getAllOrders = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = status ? { orderStatus: status } : {};
    const [orders, total] = await Promise.all([
      Order.find(query).populate('user', 'name email phone').sort({ createdAt: -1 })
        .skip((page - 1) * limit).limit(Number(limit)),
      Order.countDocuments(query),
    ]);
    res.json({ success: true, orders, total });
  } catch (error) { next(error); }
};

// ADMIN: @PUT /api/admin/orders/:id/status
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    order.orderStatus = status;
    order.statusHistory.push({ status, note: note || `Status updated to ${status}` });
    if (status === 'delivered') order.deliveredAt = new Date();
    await order.save();

    // Notify user (ignore notification failures silently to keep checkout robust)
    try {
      const Notification = require('../models/Notification');
      await Notification.create({
        user: order.user, title: 'Order Update',
        message: `Your order #${order.orderId || order._id?.slice(-8).toUpperCase()} is now ${status}`,
        type: 'order', data: { orderId: order._id },
      });
    } catch (_) {}

    res.json({ success: true, order });
  } catch (error) {
    console.error('updateOrderStatus error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};

// ADMIN: @GET /api/admin/analytics
exports.getAnalytics = async (req, res, next) => {
  try {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [totalOrders, todayOrders, totalRevenue, monthRevenue, pendingOrders] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ createdAt: { $gte: today } }),
      Order.aggregate([{ $group: { _id: null, total: { $sum: '$total' } } }]),
      Order.aggregate([{ $match: { createdAt: { $gte: thisMonth } } }, { $group: { _id: null, total: { $sum: '$total' } } }]),
      Order.countDocuments({ orderStatus: { $in: ['placed', 'confirmed', 'processing'] } }),
    ]);

    // Sales last 7 days
    const salesChart = await Order.aggregate([
      { $match: { createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, sales: { $sum: '$total' }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      success: true,
      stats: {
        totalOrders, todayOrders, pendingOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        monthRevenue: monthRevenue[0]?.total || 0,
      },
      salesChart,
    });
  } catch (error) { next(error); }
};
