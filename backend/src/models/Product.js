import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  storeOwnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  description: String,
  category: { 
    type: String, 
    enum: ['SEEDS', 'FERTILIZERS', 'PESTICIDES', 'TOOLS', 'IRRIGATION'], 
    required: true 
  },
  price: { type: Number, required: true },
  stock: { type: Number, required: true, default: 0 },
  imageUrl: String,
  unit: { type: String, default: 'kg' }, // kg, litre, piece
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Product', ProductSchema);