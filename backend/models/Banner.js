const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  image: { type: String, required: true },
  link: { type: String, default: '' },
  type: { type: String, enum: ['hero', 'promo', 'category'], default: 'promo' },
  isActive: { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 },
  bgColor: { type: String, default: '#FFD600' },
  badgeText: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Banner', bannerSchema);
