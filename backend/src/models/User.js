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
    district: String,
    point: {
      type: { type: String, default: 'Point' },
      coordinates: [Number] // [lng, lat]
    }
  },
  fcmToken: String,
  createdAt: { type: Date, default: Date.now }
});

userSchema.index({ "location.point": '2dsphere' });

userSchema.pre('save', function(next) {
  if (this.location && (!this.location.point || !this.location.point.coordinates || this.location.point.coordinates.length === 0)) {
    this.location.point = undefined;
  }
  next();
});

export default mongoose.model('User', userSchema);