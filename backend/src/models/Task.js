import mongoose from 'mongoose';

const TaskSchema = new mongoose.Schema({
  farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  taskType: { type: String, required: true },
  date: { type: Date, required: true },
  workersNeeded: { type: Number, default: 1 },
  budget: { type: Number, required: true },
  location: {
    type: { type: String, default: 'Point' },
    coordinates: [Number] // [longitude, latitude]
  },
  district: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['open', 'matched', 'booked', 'in-progress', 'completed'], 
    default: 'open' 
  },
  createdAt: { type: Date, default: Date.now }
});

TaskSchema.index({ location: '2dsphere' });

export default mongoose.model('Task', TaskSchema);