import mongoose from 'mongoose';

const BookingSchema = new mongoose.Schema({
  taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
  farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  labourId: { type: mongoose.Schema.Types.ObjectId, ref: 'Labour', required: true },
  depositAmount: { type: Number, required: true },
  razorpayOrderId: String,
  razorpayPaymentId: String,
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
  attendanceQr: String, // URL/String for QR code
  attendanceStatus: { type: String, enum: ['pending', 'scanned'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Booking', BookingSchema);