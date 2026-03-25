import mongoose from 'mongoose';

const VehicleSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { 
    type: String, 
    enum: ['Tractor', 'Harvester', 'Delivery Van', 'Water Tanker'], 
    required: true 
  },
  model: String,
  ratePerHour: { type: Number, required: true },
  district: { type: String, required: true },
  location: {
    type: { type: String, default: 'Point' },
    coordinates: [Number] // [lng, lat]
  },
  available: { type: Boolean, default: true },
  imageUrl: String,
  rating: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

VehicleSchema.index({ location: '2dsphere' });

export default mongoose.model('Vehicle', VehicleSchema);