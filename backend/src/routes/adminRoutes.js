import { Router } from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import User from '../models/User.js';
import Order from '../models/Order.js';
import VehicleBooking from '../models/VehicleBooking.js';
import Task from '../models/Task.js';
import VendorListing from '../models/VendorListing.js';

const router = Router();

// Get Platform Overview Stats (Admin Only)
router.get('/stats', protect, authorize('ADMIN'), async (req, res) => {
  try {
    const stats = {
      users: await User.countDocuments(),
      orders: await Order.countDocuments(),
      bookings: await VehicleBooking.countDocuments(),
      tasks: await Task.countDocuments(),
      listings: await VendorListing.countDocuments(),
      revenue: {
        shop: (await Order.aggregate([{ $group: { _id: null, total: { $sum: "$totalAmount" } } }]))[0]?.total || 0,
        rentals: (await VehicleBooking.aggregate([{ $group: { _id: null, total: { $sum: "$totalAmount" } } }]))[0]?.total || 0,
      }
    };

    // Get Recent Activity
    const recentOrders = await Order.find().sort('-createdAt').limit(5).populate('farmerId', 'name');
    const recentBookings = await VehicleBooking.find().sort('-createdAt').limit(5).populate('farmerId', 'name');
    const recentListings = await VendorListing.find().sort('-createdAt').limit(5).populate('farmerId', 'name');

    const activity = [
      ...recentOrders.map(o => ({ type: 'Order', user: o.farmerId?.name, amount: o.totalAmount, date: o.createdAt })),
      ...recentBookings.map(b => ({ type: 'Booking', user: b.farmerId?.name, amount: b.totalAmount, date: b.createdAt })),
      ...recentListings.map(l => ({ type: 'Listing', user: l.farmerId?.name, amount: l.unitPrice, date: l.createdAt }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10);

    res.json({ stats, activity });
  } catch (err) {
    console.error('Admin Stats Error:', err);
    res.status(500).json({ error: 'Failed to fetch admin statistics' });
  }
});

export default router;
