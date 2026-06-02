const StoreSettings = require('../models/StoreSettings');

// Helper: get-or-create the single settings document
const getSettings = async () => {
  let settings = await StoreSettings.findOne();
  if (!settings) settings = await StoreSettings.create({ isStoreOpen: true });
  return settings;
};

// @GET /api/store-settings  (public)
exports.getStoreSettings = async (req, res, next) => {
  try {
    const settings = await getSettings();
    res.json({ success: true, isStoreOpen: settings.isStoreOpen });
  } catch (error) { next(error); }
};

// @PUT /api/store-settings/toggle  (admin only)
exports.toggleStoreAvailability = async (req, res, next) => {
  try {
    const settings = await getSettings();
    settings.isStoreOpen = !settings.isStoreOpen;
    settings.updatedBy = req.user._id;
    await settings.save();
    res.json({ success: true, isStoreOpen: settings.isStoreOpen });
  } catch (error) { next(error); }
};
