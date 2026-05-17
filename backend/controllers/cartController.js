const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');

// @GET /api/cart
exports.getCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product', 'name images price stock isActive');
    if (!cart) return res.json({ success: true, cart: { items: [], subtotal: 0, itemCount: 0, discount: 0 } });
    res.json({ success: true, cart });
  } catch (error) { next(error); }
};

// @POST /api/cart/add
exports.addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const product = await Product.findById(productId);
    if (!product || !product.isActive)
      return res.status(404).json({ success: false, message: 'Product not available' });
    if (product.stock < quantity)
      return res.status(400).json({ success: false, message: 'Insufficient stock' });

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) cart = await Cart.create({ user: req.user._id, items: [] });

    const existingIndex = cart.items.findIndex(i => i.product.toString() === productId);
    if (existingIndex > -1) {
      cart.items[existingIndex].quantity += quantity;
    } else {
      cart.items.push({
        product: productId, quantity,
        price: product.price, name: product.name,
        image: product.images[0] || '', unit: product.unit,
      });
    }
    await cart.save();
    res.json({ success: true, message: 'Added to cart', cart });
  } catch (error) { next(error); }
};

// @PUT /api/cart/update
exports.updateCartItem = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });

    const idx = cart.items.findIndex(i => i.product.toString() === productId);
    if (idx === -1) return res.status(404).json({ success: false, message: 'Item not in cart' });

    if (quantity <= 0) cart.items.splice(idx, 1);
    else cart.items[idx].quantity = quantity;

    await cart.save();
    res.json({ success: true, cart });
  } catch (error) { next(error); }
};

// @DELETE /api/cart/remove/:productId
exports.removeFromCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });
    cart.items = cart.items.filter(i => i.product.toString() !== req.params.productId);
    await cart.save();
    res.json({ success: true, cart });
  } catch (error) { next(error); }
};

// @DELETE /api/cart/clear
exports.clearCart = async (req, res, next) => {
  try {
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [], discount: 0, coupon: null });
    res.json({ success: true, message: 'Cart cleared' });
  } catch (error) { next(error); }
};

// @POST /api/cart/coupon
exports.applyCoupon = async (req, res, next) => {
  try {
    const { code } = req.body;
    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
    if (!coupon) return res.status(404).json({ success: false, message: 'Invalid coupon code' });
    if (coupon.expiresAt < new Date()) return res.status(400).json({ success: false, message: 'Coupon expired' });

    const cart = await Cart.findOne({ user: req.user._id });
    const subtotal = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);

    if (subtotal < coupon.minOrderValue)
      return res.status(400).json({ success: false, message: `Minimum order ₹${coupon.minOrderValue} required` });

    let discount = coupon.type === 'percentage'
      ? (subtotal * coupon.value) / 100
      : coupon.value;
    if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);

    cart.coupon = coupon._id;
    cart.discount = discount;
    await cart.save();
    res.json({ success: true, message: `Coupon applied! You save ₹${discount}`, discount, cart });
  } catch (error) { next(error); }
};
