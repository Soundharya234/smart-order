const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  description: { type: String, default: '' },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  images: [{ type: String }],
  price: { type: Number, required: true, min: 0 },
  mrp: { type: Number, required: true, min: 0 },
  discount: { type: Number, default: 0, min: 0, max: 100 },
  unit: { type: String, default: '1 pc' },
  stock: { type: Number, default: 0, min: 0 },
  minStock: { type: Number, default: 10 },
  isFeatured: { type: Boolean, default: false },
  isBestSeller: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  tags: [{ type: String }],
  rating: { type: Number, default: 0, min: 0, max: 5 },
  reviewCount: { type: Number, default: 0 },
  deliveryTime: { type: String, default: '10-20 mins' },
  nutritionInfo: { type: String, default: '' },
  brand: { type: String, default: '' },
  sku: { type: String, unique: true, sparse: true },
  weight: { type: String, default: '' },
}, { timestamps: true });

productSchema.virtual('isLowStock').get(function () {
  return this.stock <= this.minStock;
});

productSchema.virtual('discountAmount').get(function () {
  return this.mrp - this.price;
});

module.exports = mongoose.model('Product', productSchema);
