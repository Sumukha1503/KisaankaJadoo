import mongoose from 'mongoose';

const DiseaseScanSchema = new mongoose.Schema({
  farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  imageUrl: String,
  prediction: { type: String, required: true },
  confidence: { type: Number, required: true },
  remedy: String,
  severity: String,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('DiseaseScan', DiseaseScanSchema);