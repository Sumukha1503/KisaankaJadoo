import mongoose from 'mongoose';
import User from './src/models/User.js';
import Labour from './src/models/Labour.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const seedLabourers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/kisaankajadoo');
    console.log('Seed: Connected to MongoDB');

    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const mockData = [
      { name: 'Ravi Kumar', phone: '9876543210', skills: ['harvesting', 'sowing'], wage: 550, district: 'Mysuru', lat: 12.2958, lng: 76.6394 },
      { name: 'Suresh Raina', phone: '9876543211', skills: ['spraying', 'irrigation'], wage: 600, district: 'Bengaluru', lat: 12.9716, lng: 77.5946 },
      { name: 'Manju Swamy', phone: '9876543212', skills: ['weeding', 'transport'], wage: 500, district: 'Hassan', lat: 13.0068, lng: 76.1025 }
    ];

    for (const data of mockData) {
      // Check if user exists
      let user = await User.findOne({ phone: data.phone });
      if (!user) {
        user = new User({
          name: data.name,
          phone: data.phone,
          password: hashedPassword,
          role: 'LABOUR'
        });
        await user.save();
      }

      // Check if labour profile exists
      let labour = await Labour.findOne({ userId: user._id });
      if (!labour) {
        labour = new Labour({
          userId: user._id,
          name: data.name,
          phone: data.phone,
          skills: data.skills,
          wage: data.wage,
          district: data.district,
          location: { type: 'Point', coordinates: [data.lng, data.lat] },
          isReady: true,
          rating: 4.5 + Math.random() * 0.5,
          jobsCompleted: Math.floor(Math.random() * 20)
        });
        await labour.save();
        console.log(`Created labour profile for ${data.name}`);
      } else {
        labour.isReady = true;
        await labour.save();
        console.log(`Updated labour profile for ${data.name} to READY`);
      }
    }

    console.log('Seed: Completed successfully');
    process.exit(0);
  } catch (err) {
    console.error('Seed Error:', err);
    process.exit(1);
  }
};

seedLabourers();
