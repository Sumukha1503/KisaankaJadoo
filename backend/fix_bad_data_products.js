import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function checkData() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/kisaankajadoo');
    console.log('Connected to MongoDB');
    
    const db = mongoose.connection.db;
    const badDocs = await db.collection('products').find({
      $or: [
        { "location.coordinates": { $exists: false } },
        { "location.coordinates": null },
        { "location.coordinates": { $size: 0 } },
        { "location.coordinates": { $size: 1 } },
        { "location.coordinates.0": null },
        { "location.coordinates.1": null },
        { "location.coordinates.0": NaN },
        { "location.coordinates.1": NaN }
      ]
    }).toArray();
    
    console.log('Found documents with bad location data:', badDocs.length);
    if (badDocs.length > 0) {
      console.log(JSON.stringify(badDocs.map(d => ({ _id: d._id, name: d.name, location: d.location })), null, 2));
      
      // Attempt to fix them by providing a default location (Hassan, Karnataka)
      const result = await db.collection('products').updateMany(
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
      console.log('Fixed documents:', result.modifiedCount);
    }
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

checkData();
