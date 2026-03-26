import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function checkIndexes() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/kisaankajadoo');
    console.log('Connected to MongoDB');
    
    const db = mongoose.connection.db;
    const indexes = await db.collection('products').indexes();
    console.log('Products Indexes:', JSON.stringify(indexes, null, 2));
    
    // Also check vendorlistings
    const vendorIndexes = await db.collection('vendorlistings').indexes();
    console.log('VendorListings Indexes:', JSON.stringify(vendorIndexes, null, 2));
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

checkIndexes();
