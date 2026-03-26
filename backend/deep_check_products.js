import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function deepCheck() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/kisaankajadoo');
    console.log('Connected to MongoDB');
    
    const db = mongoose.connection.db;
    const allProducts = await db.collection('products').find({}).toArray();
    
    console.log(`Checking ${allProducts.length} products...`);
    const badDocs = [];
    
    for (const doc of allProducts) {
      const loc = doc.location;
      if (!loc) {
        badDocs.push({ id: doc._id, reason: 'Missing location' });
        continue;
      }
      if (loc.type !== 'Point') {
        badDocs.push({ id: doc._id, reason: `Wrong type: ${loc.type}` });
        continue;
      }
      if (!Array.isArray(loc.coordinates) || loc.coordinates.length !== 2) {
        badDocs.push({ id: doc._id, reason: `Invalid coordinates: ${JSON.stringify(loc.coordinates)}` });
        continue;
      }
      if (typeof loc.coordinates[0] !== 'number' || typeof loc.coordinates[1] !== 'number' || isNaN(loc.coordinates[0]) || isNaN(loc.coordinates[1])) {
        badDocs.push({ id: doc._id, reason: `Non-number coordinates: ${JSON.stringify(loc.coordinates)}` });
        continue;
      }
    }
    
    console.log('Deep check results:', badDocs.length, 'bad documents found');
    if (badDocs.length > 0) {
      console.log(JSON.stringify(badDocs, null, 2));
      
      // Fix them
      for (const bad of badDocs) {
        await db.collection('products').updateOne(
          { _id: bad.id },
          { $set: { location: { type: 'Point', coordinates: [76.1004, 13.0033] } } }
        );
      }
      console.log('Fixed all bad documents');
    }
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

deepCheck();
