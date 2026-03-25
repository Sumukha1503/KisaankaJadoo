import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

// Route imports will go here as we implement them
import authRoutes from './src/routes/authRoutes.js';
import labourRoutes from './src/routes/labourRoutes.js';
import farmRoutes from './src/routes/farmRoutes.js';
import paymentRoutes from './src/routes/paymentRoutes.js';
import shopRoutes from './src/routes/shopRoutes.js';
import aiRoutes from './src/routes/aiRoutes.js';
import vehicleRoutes from './src/routes/vehicleRoutes.js';
import vendorRoutes from './src/routes/vendorRoutes.js';
import analyticsRoutes from './src/routes/analyticsRoutes.js';

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Basic health check
app.get('/health', (req, res) => res.json({ status: 'ok', msg: 'KisaanKaJadoo API is running' }));

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/labour', labourRoutes);
app.use('/api/farm', farmRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/shop', shopRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/analytics', analyticsRoutes);

const PORT = process.env.PORT || 5001;

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/kisaankajadoo')
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('❌ MongoDB Connection Error:', err);
    process.exit(1);
  });