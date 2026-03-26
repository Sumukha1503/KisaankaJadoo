import mongoose from 'mongoose';

const PriceVoteSchema = new mongoose.Schema({
  farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  crop: { type: String, required: true },
  votedPrice: { type: Number, required: true },
  district: { type: String },
  date: { type: String, default: () => new Date().toISOString().split('T')[0] } // Daily voting
}, { timestamps: true });

// Ensure one vote per farmer per crop per day
PriceVoteSchema.index({ farmerId: 1, crop: 1, date: 1 }, { unique: true });

export default mongoose.model('PriceVote', PriceVoteSchema);
