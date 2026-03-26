import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function deepFix() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/kisaankajadoo');
    console.log('Connected to MongoDB');
    
    const db = mongoose.connection.db;
    const collections = ['vendorlistings', 'labours', 'vehicles', 'tasks'];
    
    for (const colName of collections) {
      console.log(`Checking ${colName}...`);
      const result = await db.collection(colName).updateMany(
        {
          $or: [
            { "location.coordinates": { $exists: false } },
            { "location.coordinates": null },
            { "location.coordinates": { $size: 0 } },
            { "location.coordinates": { $size: 1 } },
            { "location.coordinates.0": null },
            { "location.coordinates.1": null },
            { "location.coordinates.0": { $type: "double", $eq: NaN } },
            { "location.coordinates.1": { $type: "double", $eq: NaN } }
          ]
        },
        {
          $set: {
            "location": { type: "Point", coordinates: [76.1004, 13.0033] }
          }
        }
      );
      console.log(`Fixed ${result.modifiedCount} docs in ${colName}`);
    }
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

deepFix();
