import mongoose from 'mongoose';

const FarmAnalysisSchema = new mongoose.Schema({
  farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  crop: { type: String, required: true },
  acreage: { type: Number, required: true },
  soilType: { type: String, required: true },
  city: { type: String, required: true },
  weather: {
    temp: Number,
    condition: String
  },
  estimatedYield: Number,
  marketValue: Number,
  recommendations: [String],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('FarmAnalysis', FarmAnalysisSchema);
