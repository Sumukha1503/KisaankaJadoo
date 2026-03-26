import mongoose from 'mongoose';

const LabourSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  aadhaar: String,
  skills: [{ type: String }],
  wage: { type: Number, required: true },
  rating: { type: Number, default: 0 },
  location: {
    type: { type: String, default: 'Point' },
    coordinates: [Number] // [longitude, latitude]
  },
  district: { type: String, required: true },
  availability: [{ type: Date }],
  jobsCompleted: { type: Number, default: 0 },
  verified: { type: Boolean, default: true },
  isReady: { type: Boolean, default: false }
});

LabourSchema.index({ location: '2dsphere' });

export default mongoose.model('Labour', LabourSchema);