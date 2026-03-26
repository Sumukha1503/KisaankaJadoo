import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/kisaankajadoo';

async function checkVehicles() {
  console.log('Connecting to MongoDB...');
  try {
    await mongoose.connect(MONGO_URI);
    
    // We can't import Vehicle model easily here without whole backend context
    const vehicles = await mongoose.connection.db.collection('vehicles').find({}).toArray();
    console.log(`--- VEHICLES IN DATABASE: ${vehicles.length} ---`);
    if (vehicles.length > 0) {
      console.log('Sample Vehicle:', JSON.stringify(vehicles[0], null, 2));
    } else {
      console.log('⚠️ NO VEHICLES FOUND. The rental page will be empty.');
    }
  } catch (err) {
    console.error('Connection failed:', err.message);
  } finally {
    await mongoose.disconnect();
  }
}

checkVehicles();
