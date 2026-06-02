const mongoose = require('mongoose');

const storeSettingsSchema = new mongoose.Schema({
  isStoreOpen: { type: Boolean, default: true },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('StoreSettings', storeSettingsSchema);
