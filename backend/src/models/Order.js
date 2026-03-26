import mongoose from 'mongoose';

const OrderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: String,
  quantity: { type: Number, required: true },
  price: { type: Number, required: true }
});

const OrderSchema = new mongoose.Schema({
  farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  storeOwnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [OrderItemSchema],
  totalAmount: { type: Number, required: true },
  paymentMethod: { type: String, enum: ['RAZORPAY', 'COD'], default: 'COD' },
  paymentStatus: { type: String, enum: ['PENDING', 'PAID', 'FAILED'], default: 'PENDING' },
  razorpayOrderId: String,
  razorpayPaymentId: String,
  status: { 
    type: String, 
    enum: ['PENDING', 'PACKED', 'SHIPPED', 'DELIVERED'], 
    default: 'PENDING' 
  },
  shippingAddress: {
    address: String,
    district: String,
    pinCode: String
  },
  trackingId: { type: String, unique: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Order', OrderSchema);