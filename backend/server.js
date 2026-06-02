require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');

const app = express();

// Connect DB
connectDB();

// Middleware
app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:8081', process.env.FRONTEND_URL].filter(Boolean), credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/users', require('./routes/users'));
app.use('/api/banners', require('./routes/banners'));
app.use('/api/coupons', require('./routes/coupons'));
app.use('/api/store-settings', require('./routes/storeSettings'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: '🚀 QuickPick API is running!', timestamp: new Date() });
});

// Database Seeder
app.get('/api/seed', async (req, res, next) => {
  try {
    const seed = require('./seed');
    await seed();
    res.json({ success: true, message: '🌱 Database seeded successfully on production!' });
  } catch (err) {
    next(err);
  }
});

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 QuickPick Backend running on http://localhost:${PORT}`);
  console.log(`📦 Environment: ${process.env.NODE_ENV}`);
});
