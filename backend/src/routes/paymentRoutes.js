import { Router } from 'express';
import { protect } from '../middleware/authMiddleware.js';
import crypto from 'crypto';
// Mock razorpay for hackathon purposes if credentials aren't passed
import Razorpay from 'razorpay'; 
import User from '../models/User.js';
import { sendPaymentSuccessEmail } from '../utils/emailService.js';

const router = Router();

router.post('/create-order', protect, async (req, res) => {
  try {
    // If no credentials in .env, just mock it
    if (!process.env.RZP_KEY || !process.env.RZP_SECRET) {
      return res.json({ id: `order_mock_${Date.now()}`, amount: req.body.amount, currency: 'INR' });
    }

    const rzp = new Razorpay({
      key_id: process.env.RZP_KEY,
      key_secret: process.env.RZP_SECRET
    });

    const order = await rzp.orders.create({
      amount: req.body.amount, // amount in paisa
      currency: "INR"
    });

    res.json(order);
  } catch (err) {
    console.error('Razorpay Error:', err);
    res.status(500).json({ error: 'Payment Order creation failed' });
  }
});

router.post('/verify', protect, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    
    if (!process.env.RZP_SECRET) {
      // Mock validation success
      const user = await User.findById(req.user.id);
      if (user?.email) {
        await sendPaymentSuccessEmail(user.email, {
          amount: req.body.amount || '0',
          paymentId: `MOCK-${Date.now()}`,
          purpose: 'Order/Booking Payment'
        });
      }
      return res.json({ success: true, message: 'Mock validation successful' });
    }

    const secret = process.env.RZP_SECRET;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');

    if (expectedSignature === razorpay_signature) {
      res.json({ success: true, message: 'Payment verified successfully' });
    } else {
      res.status(400).json({ success: false, error: 'Invalid Payment Signature' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Payment verification failed' });
  }
});

export default router;