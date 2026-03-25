import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function checkSystem() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/kisaankajadoo');
    console.log('✅ DB Connected');
    
    const User = mongoose.model('User', new mongoose.Schema({}));
    const userCount = await User.countDocuments();
    console.log('Total Users:', userCount);
    
    const Scan = mongoose.model('DiseaseScan', new mongoose.Schema({}));
    const scanCount = await Scan.countDocuments();
    console.log('Total Scans:', scanCount);
    
    await mongoose.disconnect();
  } catch (err) {
    console.error('❌ System check failed:', err.message);
  }
}

checkSystem();
