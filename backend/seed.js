require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Category = require('./models/Category');
const Product = require('./models/Product');
const Coupon = require('./models/Coupon');
const Banner = require('./models/Banner');

const categories = [
  { name: 'Fresh Vegetables', slug: 'fresh-vegetables', icon: '🥦', color: '#00C853', sortOrder: 1 },
  { name: 'Fresh Fruits', slug: 'fresh-fruits', icon: '🍎', color: '#FF6D00', sortOrder: 2 },
  { name: 'Dairy & Eggs', slug: 'dairy-eggs', icon: '🥛', color: '#2979FF', sortOrder: 3 },
  { name: 'Snacks', slug: 'snacks', icon: '🍿', color: '#FFD600', sortOrder: 4 },
  { name: 'Beverages', slug: 'beverages', icon: '🧃', color: '#00BCD4', sortOrder: 5 },
  { name: 'Instant Foods', slug: 'instant-foods', icon: '🍜', color: '#E91E63', sortOrder: 6 },
  { name: 'Bakery', slug: 'bakery', icon: '🍞', color: '#FF8F00', sortOrder: 7 },
  { name: 'Staples', slug: 'staples', icon: '🌾', color: '#8D6E63', sortOrder: 8 },
];

const getProducts = (cats) => {
  const catMap = {};
  cats.forEach(c => { catMap[c.slug] = c._id; });
  return [
    // Vegetables
    { name: 'Fresh Tomatoes', slug: 'fresh-tomatoes', category: catMap['fresh-vegetables'], price: 29, mrp: 40, discount: 28, unit: '500g', stock: 100, isFeatured: true, rating: 4.5, reviewCount: 120, images: ['https://images.unsplash.com/photo-1518977676601-b53f02ac6d31?w=400&h=400&fit=crop'], tags: ['tomato', 'fresh', 'vegetable'] },
    { name: 'Green Spinach', slug: 'green-spinach', category: catMap['fresh-vegetables'], price: 19, mrp: 25, discount: 24, unit: '250g', stock: 80, rating: 4.3, reviewCount: 89, images: ['https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&h=400&fit=crop'], tags: ['spinach', 'leafy', 'greens'] },
    { name: 'Baby Carrots', slug: 'baby-carrots', category: catMap['fresh-vegetables'], price: 49, mrp: 65, discount: 25, unit: '500g', stock: 60, isBestSeller: true, rating: 4.6, reviewCount: 200, images: ['https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400&h=400&fit=crop'], tags: ['carrot', 'orange', 'healthy'] },
    { name: 'Onions Premium', slug: 'onions-premium', category: catMap['fresh-vegetables'], price: 39, mrp: 50, discount: 22, unit: '1kg', stock: 150, rating: 4.4, reviewCount: 310, images: ['https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=400&h=400&fit=crop'], tags: ['onion', 'kitchen', 'essential'] },
    { name: 'Green Capsicum', slug: 'green-capsicum', category: catMap['fresh-vegetables'], price: 35, mrp: 45, discount: 22, unit: '250g', stock: 45, rating: 4.2, reviewCount: 67, images: ['https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=400&h=400&fit=crop'], tags: ['capsicum', 'bell pepper'] },
    // Fruits
    { name: 'Alphonso Mangoes', slug: 'alphonso-mangoes', category: catMap['fresh-fruits'], price: 199, mrp: 280, discount: 29, unit: '6 pcs', stock: 40, isFeatured: true, isBestSeller: true, rating: 4.9, reviewCount: 567, images: ['https://images.unsplash.com/photo-1605027990121-cbae9e0642df?w=400&h=400&fit=crop'], tags: ['mango', 'summer', 'tropical'] },
    { name: 'Strawberries', slug: 'strawberries', category: catMap['fresh-fruits'], price: 99, mrp: 140, discount: 29, unit: '250g', stock: 30, rating: 4.7, reviewCount: 234, images: ['https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=400&h=400&fit=crop'], tags: ['strawberry', 'berry', 'red'] },
    { name: 'Green Grapes', slug: 'green-grapes', category: catMap['fresh-fruits'], price: 79, mrp: 110, discount: 28, unit: '500g', stock: 55, rating: 4.5, reviewCount: 178, images: ['https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=400&h=400&fit=crop'], tags: ['grapes', 'fruit', 'green'] },
    { name: 'Bananas Premium', slug: 'bananas-premium', category: catMap['fresh-fruits'], price: 45, mrp: 60, discount: 25, unit: '12 pcs', stock: 90, isBestSeller: true, rating: 4.4, reviewCount: 445, images: ['https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&h=400&fit=crop'], tags: ['banana', 'yellow', 'energy'] },
    // Dairy
    { name: 'Farm Fresh Milk', slug: 'farm-fresh-milk', category: catMap['dairy-eggs'], price: 69, mrp: 75, discount: 8, unit: '1L', stock: 200, isFeatured: true, rating: 4.8, reviewCount: 892, images: ['https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&h=400&fit=crop'], tags: ['milk', 'dairy', 'fresh'] },
    { name: 'Farm Eggs (12 pcs)', slug: 'farm-eggs-12', category: catMap['dairy-eggs'], price: 89, mrp: 108, discount: 18, unit: '12 pcs', stock: 150, isBestSeller: true, rating: 4.7, reviewCount: 456, images: ['https://images.unsplash.com/photo-1587486913049-53fc88980cfc?w=400&h=400&fit=crop'], tags: ['eggs', 'protein', 'breakfast'] },
    { name: 'Greek Yogurt', slug: 'greek-yogurt', category: catMap['dairy-eggs'], price: 79, mrp: 99, discount: 20, unit: '400g', stock: 80, rating: 4.6, reviewCount: 234, images: ['https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=400&fit=crop'], tags: ['yogurt', 'probiotic', 'healthy'] },
    { name: 'Butter (Salted)', slug: 'butter-salted', category: catMap['dairy-eggs'], price: 55, mrp: 65, discount: 15, unit: '100g', stock: 120, rating: 4.5, reviewCount: 322, images: ['https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400&h=400&fit=crop'], tags: ['butter', 'dairy', 'spread'] },
    // Snacks
    { name: 'Lays Magic Masala', slug: 'lays-magic-masala', category: catMap['snacks'], price: 20, mrp: 20, discount: 0, unit: '26g', stock: 300, isBestSeller: true, rating: 4.3, reviewCount: 1200, images: ['https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&h=400&fit=crop'], tags: ['chips', 'lays', 'snack'] },
    { name: 'Oreo Cookies', slug: 'oreo-cookies', category: catMap['snacks'], price: 35, mrp: 40, discount: 13, unit: '120g', stock: 200, isFeatured: true, rating: 4.8, reviewCount: 890, images: ['https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&h=400&fit=crop'], tags: ['oreo', 'cookie', 'chocolate'] },
    { name: 'Mixed Nuts Premium', slug: 'mixed-nuts-premium', category: catMap['snacks'], price: 299, mrp: 380, discount: 21, unit: '250g', stock: 50, isFeatured: true, rating: 4.7, reviewCount: 340, images: ['https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=400&h=400&fit=crop'], tags: ['nuts', 'healthy', 'protein'] },
    // Beverages
    { name: 'Coconut Water', slug: 'coconut-water', category: catMap['beverages'], price: 49, mrp: 65, discount: 25, unit: '330ml', stock: 100, isFeatured: true, rating: 4.6, reviewCount: 450, images: ['https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=400&h=400&fit=crop'], tags: ['coconut', 'natural', 'hydration'] },
    { name: 'Orange Juice', slug: 'orange-juice', category: catMap['beverages'], price: 89, mrp: 110, discount: 19, unit: '1L', stock: 75, isBestSeller: true, rating: 4.5, reviewCount: 287, images: ['https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400&h=400&fit=crop'], tags: ['juice', 'orange', 'vitamin C'] },
    { name: 'Green Tea (25 bags)', slug: 'green-tea-25', category: catMap['beverages'], price: 120, mrp: 150, discount: 20, unit: '25 bags', stock: 60, rating: 4.7, reviewCount: 189, images: ['https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=400&fit=crop'], tags: ['tea', 'green', 'healthy'] },
    // Instant Foods
    { name: 'Maggi Noodles', slug: 'maggi-noodles', category: catMap['instant-foods'], price: 75, mrp: 84, discount: 11, unit: '6 pack', stock: 250, isBestSeller: true, rating: 4.6, reviewCount: 2100, images: ['https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=400&h=400&fit=crop'], tags: ['noodles', 'maggi', 'instant'] },
    { name: 'Oatmeal Breakfast', slug: 'oatmeal-breakfast', category: catMap['instant-foods'], price: 199, mrp: 249, discount: 20, unit: '500g', stock: 80, isFeatured: true, rating: 4.5, reviewCount: 340, images: ['https://images.unsplash.com/photo-1608686207856-001b95cf60ca?w=400&h=400&fit=crop'], tags: ['oats', 'healthy', 'breakfast'] },
    // Bakery
    { name: 'Whole Wheat Bread', slug: 'whole-wheat-bread', category: catMap['bakery'], price: 45, mrp: 55, discount: 18, unit: '400g', stock: 120, isBestSeller: true, rating: 4.4, reviewCount: 567, images: ['https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=400&fit=crop'], tags: ['bread', 'wheat', 'healthy'] },
    { name: 'Croissants (4 pcs)', slug: 'croissants-4pcs', category: catMap['bakery'], price: 129, mrp: 160, discount: 19, unit: '4 pcs', stock: 40, isFeatured: true, rating: 4.8, reviewCount: 234, images: ['https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&h=400&fit=crop'], tags: ['croissant', 'butter', 'bakery'] },
    // Staples
    { name: 'Basmati Rice Premium', slug: 'basmati-rice-premium', category: catMap['staples'], price: 249, mrp: 299, discount: 17, unit: '1kg', stock: 200, isBestSeller: true, rating: 4.7, reviewCount: 890, images: ['https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=400&fit=crop'], tags: ['rice', 'basmati', 'staple'] },
    { name: 'Whole Wheat Flour', slug: 'whole-wheat-flour', category: catMap['staples'], price: 79, mrp: 95, discount: 17, unit: '1kg', stock: 150, rating: 4.5, reviewCount: 450, images: ['https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=400&fit=crop'], tags: ['flour', 'wheat', 'atta'] },
  ].map(p => ({ ...p, slug: p.slug + '-' + Math.floor(Math.random() * 9000 + 1000), sku: 'LEO' + Math.floor(Math.random() * 90000 + 10000) }));
};

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing
    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Product.deleteMany({}),
      Coupon.deleteMany({}),
      Banner.deleteMany({}),
    ]);
    console.log('🗑️  Cleared existing data');

    // Admin user
    const admin = await User.create({
      name: 'LeoFrankline Edison',
      email: 'admin@quickpick.com',
      password: 'LeoAdmin@2024',
      role: 'admin',
      isVerified: true,
    });
    console.log('👤 Admin created:', admin.email);

    // Sample customer
    await User.create({
      name: 'Demo Customer',
      email: 'customer@demo.com',
      password: 'customer123',
      phone: '9876543210',
      role: 'customer',
      isVerified: true,
    });

    // Categories
    const cats = await Category.insertMany(categories);
    console.log(`📁 ${cats.length} categories created`);

    // Products
    const products = getProducts(cats);
    await Product.insertMany(products);
    console.log(`📦 ${products.length} products created`);

    // Coupons
    await Coupon.insertMany([
      { code: 'WELCOME50', description: 'Welcome offer - 50% off up to ₹100', type: 'percentage', value: 50, minOrderValue: 199, maxDiscount: 100, usageLimit: 1, expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
      { code: 'LEOEDI20', description: '20% off on all orders', type: 'percentage', value: 20, minOrderValue: 299, maxDiscount: 200, expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) },
      { code: 'FLAT100', description: '₹100 off on orders above ₹499', type: 'flat', value: 100, minOrderValue: 499, expiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000) },
      { code: 'FRESH30', description: '30% off on Fresh Vegetables & Fruits', type: 'percentage', value: 30, minOrderValue: 149, maxDiscount: 150, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
    ]);
    console.log('🎟️  Coupons created');

    // Banners
    await Banner.insertMany([
      { title: 'Freshness Delivered Fast', subtitle: 'Groceries at your door in 15 minutes', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&h=400&fit=crop', type: 'hero', bgColor: '#FFD600', sortOrder: 1, badgeText: '🚀 Super Fast' },
      { title: 'Fresh Vegetables 40% OFF', subtitle: 'Farm to door daily', image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&h=300&fit=crop', type: 'promo', bgColor: '#00C853', sortOrder: 2, badgeText: '40% OFF' },
      { title: 'New: Premium Dairy Range', subtitle: 'Farm fresh, delivered daily', image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=800&h=300&fit=crop', type: 'promo', bgColor: '#2979FF', sortOrder: 3, badgeText: 'NEW' },
    ]);
    console.log('🖼️  Banners created');

    console.log('\n🎉 Database seeded successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Admin: admin@quickpick.com | LeoAdmin@2024');
    console.log('Customer: customer@demo.com | customer123');
    console.log('Coupons: WELCOME50, LEOEDI20, FLAT100, FRESH30');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    return { success: true, message: 'Database seeded successfully!' };
  } catch (err) {
    console.error('❌ Seed error:', err);
    throw err;
  }
};

if (require.main === module) {
  seed().then(() => process.exit(0)).catch(() => process.exit(1));
}

module.exports = seed;
