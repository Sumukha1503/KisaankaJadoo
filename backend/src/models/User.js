import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, unique: true, sparse: true },
  email: { type: String, unique: true, sparse: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['FARMER', 'STORE_OWNER', 'VEHICLE_OWNER', 'LABOUR', 'VENDOR', 'ADMIN'], 
    default: 'FARMER' 
  },
  isVerified: { type: Boolean, default: false },
  // Basic user profile details
  location: {
    lat: Number,
    lng: Number,
    district: String
  },
  fcmToken: String,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('User', userSchema);