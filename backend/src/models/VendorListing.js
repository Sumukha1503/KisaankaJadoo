import mongoose from 'mongoose';

const VendorListingSchema = new mongoose.Schema({
  farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  crop: { type: String, required: true },
  quantityReq: { type: Number, required: true }, // in quintals
  unitPrice: { type: Number, required: true }, // per quintal
  district: { type: String, required: true },
  status: { type: String, enum: ['open', 'negotiating', 'sold'], default: 'open' },
  offers: [{
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    offeredPrice: Number,
    status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
    date: { type: Date, default: Date.now }
  }],
  location: {
    type: { type: String, default: 'Point' },
    coordinates: [Number] // [lng, lat]
  },
  imageUrl: { type: String },
  isVerified: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

VendorListingSchema.index({ location: '2dsphere' });

export default mongoose.model('VendorListing', VendorListingSchema);