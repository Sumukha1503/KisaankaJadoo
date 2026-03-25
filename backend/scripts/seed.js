import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../src/models/Product.js';
import Vehicle from '../src/models/Vehicle.js';
import VendorListing from '../src/models/VendorListing.js';
import User from '../src/models/User.js';
import bcrypt from 'bcryptjs';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/kisaankajadoo';

const seedDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB for seeding...');

    // 1. Create Dummy Users
    await User.deleteMany({});
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    const users = await User.insertMany([
      { name: 'Admin User', email: 'admin@kisaan.com', password: hashedPassword, role: 'ADMIN', phone: '9999999999' },
      { name: 'Shop Owner', email: 'shop@kisaan.com', password: hashedPassword, role: 'STORE_OWNER', phone: '9876543210' },
      { name: 'Vendor Ravi', email: 'vendor@kisaan.com', password: hashedPassword, role: 'VENDOR', phone: '9876543215' },
      { name: 'Gurpreet Singh', email: 'gurpreet@kisaan.com', password: hashedPassword, role: 'VEHICLE_OWNER', phone: '9876543211' },
      { name: 'Ramesh Farmer', email: 'ramesh@kisaan.com', password: hashedPassword, role: 'FARMER', phone: '9876543212' },
      { name: 'Lakhwinder Labour', email: 'labour@kisaan.com', password: hashedPassword, role: 'LABOUR', phone: '9876543213' },
    ]);

    const adminId = users[0]._id;
    const shopOwnerId = users[1]._id;
    const vendorId = users[2]._id;
    const vehicleOwnerId = users[3]._id;
    const farmerId = users[4]._id;
    const labourId = users[5]._id;

    // 2. Seed Products
    await Product.deleteMany({});
    await Product.insertMany([
      { storeOwnerId: shopOwnerId, name: 'Premium Wheat Seeds', category: 'SEEDS', price: 850, stock: 50, imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80', description: 'High-yield variety, resistant to common rust.', unit: 'kg' },
      { storeOwnerId: shopOwnerId, name: 'NPK Fertilizer 50kg', category: 'FERTILIZERS', price: 1200, stock: 30, imageUrl: 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=800&q=80', description: 'Balanced nutrients for all-round growth.', unit: 'bag' },
      { storeOwnerId: shopOwnerId, name: 'Drip Irrigation Kit', category: 'IRRIGATION', price: 4500, stock: 12, imageUrl: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=80', description: 'Efficient water delivery system for 1 acre.', unit: 'set' },
      { storeOwnerId: shopOwnerId, name: 'Organic Compost 25kg', category: 'FERTILIZERS', price: 600, stock: 80, imageUrl: 'https://images.unsplash.com/photo-1592150621744-aca64f48394a?w=800&q=80', description: '100% organic waste vermicompost.', unit: 'bag' },
      { storeOwnerId: shopOwnerId, name: 'Hand Sprayer 16L', category: 'TOOLS', price: 1800, stock: 25, imageUrl: 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=800&q=80', description: 'Battery-operated efficient pressure sprayer.', unit: 'piece' },
    ]);
    console.log('Seeded Products ✅');

    // 3. Seed Vehicles
    await Vehicle.deleteMany({});
    await Vehicle.insertMany([
      { ownerId: vehicleOwnerId, name: 'Mahindra Tractor 575 DI', type: 'Tractor', ratePerHour: 500, district: 'Ludhiana', image: 'https://images.unsplash.com/photo-1605338664649-10f38a8e3c89?w=800&q=80', location: { type: 'Point', coordinates: [75.8573, 30.9010] }, available: true },
      { ownerId: vehicleOwnerId, name: 'Mini Harvester Combine', type: 'Harvester', ratePerHour: 1500, district: 'Amritsar', image: 'https://images.unsplash.com/photo-1565793969853-9b23fc42f2bf?w=800&q=80', location: { type: 'Point', coordinates: [74.8723, 31.6340] }, available: true },
    ]);
    console.log('Seeded Vehicles ✅');

    // 4. Seed Vendor Listings
    await VendorListing.deleteMany({});
    await VendorListing.insertMany([
      { farmerId: farmerId, crop: 'Premium Basmati Rice', quantityReq: 50, unitPrice: 4000, district: 'Amritsar', status: 'open' },
      { farmerId: farmerId, crop: 'Organic Wheat', quantityReq: 120, unitPrice: 2200, district: 'Ludhiana', status: 'open' },
    ]);
    console.log('Seeded Vendor Listings ✅');

    console.log('Seeding COMPLETE! 🚀');
    process.exit();
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
};

seedDB();
