/**
 * Seed script — creates default admins and categories
 * Run: npm run seed
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('./models/Admin');
const Category = require('./models/Category');
const connectDB = require('./config/db');

const seedData = async () => {
  try {
    await connectDB();

    // ─── Create default admins ─────────────────────────
    const defaultAdmins = [
      { name: 'pakal', email: 'pakal@campuscanteen.com', password: 'Admin@123' },
      { name: 'harsha', email: 'harsha@campuscanteen.com', password: 'Admin@123' },
    ];

    for (const admin of defaultAdmins) {
      const existing = await Admin.findOne({ email: admin.email });
      if (!existing) {
        await Admin.create(admin);
        console.log(`✅ Admin "${admin.name}" created (${admin.email})`);
      } else {
        console.log(`ℹ️  Admin "${admin.name}" already exists`);
      }
    }

    // ─── Create default categories ─────────────────────
    const defaultCategories = [
      { name: 'Breakfast', icon: '🌅', description: 'Start your day with delicious breakfast options', sortOrder: 1 },
      { name: 'Lunch', icon: '🍛', description: 'Hearty lunch meals to keep you going', sortOrder: 2 },
      { name: 'Snacks', icon: '🍟', description: 'Light bites and snacks for any time', sortOrder: 3 },
      { name: 'Drinks', icon: '🥤', description: 'Refreshing beverages and drinks', sortOrder: 4 },
    ];

    for (const cat of defaultCategories) {
      const existing = await Category.findOne({ name: cat.name });
      if (!existing) {
        await Category.create(cat);
        console.log(`✅ Category "${cat.name}" created`);
      } else {
        console.log(`ℹ️  Category "${cat.name}" already exists`);
      }
    }

    console.log('\n🎉 Seed completed!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error.message);
    process.exit(1);
  }
};

seedData();
