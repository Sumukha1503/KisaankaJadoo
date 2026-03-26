import { Router } from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import mongoose from 'mongoose';
import Task from '../models/Task.js';
import User from '../models/User.js';
import VendorListing from '../models/VendorListing.js';
import Vehicle from '../models/Vehicle.js';
import Product from '../models/Product.js';
import { sendWeeklySummary } from '../utils/emailService.js';

const router = Router();

// Get Analytics Dashboard (All Roles)
router.get('/', protect, async (req, res) => {
  try {
    const [
      userCount, 
      listingCount, 
      taskCount,
      vehicleCount,
      productCount,
      userBreakdown
    ] = await Promise.all([
      User.countDocuments({}),
      VendorListing.countDocuments({ status: 'open' }),
      Task.countDocuments({ status: 'open' }),
      Vehicle.countDocuments({}),
      Product.countDocuments({}),
      User.aggregate([
        { $group: { _id: "$role", count: { $sum: 1 } } }
      ])
    ]);

    const roleStats = {};
    userBreakdown.forEach(item => {
      roleStats[item._id] = item.count;
    });

    let dashboardData = {
      yieldTrend: [
        { month: 'Jan', yield: 2400 },
        { month: 'Feb', yield: 3800 },
        { month: 'Mar', yield: 4200 },
        { month: 'Apr', yield: 3900 },
        { month: 'May', yield: 4800 },
        { month: 'Jun', yield: 5200 },
      ],
      labourUsage: [
        { week: 'W1', bookings: 12 },
        { week: 'W2', bookings: 18 },
        { week: 'W3', bookings: 15 },
        { week: 'W4', bookings: 22 },
      ],
      moduleBreakdown: [
        { name: 'Wizard', value: 45 },
        { name: 'Scanner', value: 25 },
        { name: 'Shop', value: 20 },
        { name: 'Market', value: 10 },
      ],
      stats: {
        totalUsers: userCount,
        activeListings: listingCount,
        scansToday: 124, 
        totalRevenue: 1250000,
        vehicles: vehicleCount,
        products: productCount,
        tasks: taskCount,
        roles: roleStats
      }
    };

    if (req.user.role === 'LABOUR') {
      dashboardData.title = 'Labour Earnings & Impact';
      dashboardData.stats.primaryMetric = { label: 'Jobs Completed', value: 42 };
      dashboardData.stats.secondaryMetric = { label: 'Total Earnings', value: '₹12,400' };
    } else if (req.user.role === 'STORE_OWNER') {
      dashboardData.title = 'Store Performance';
      dashboardData.stats.primaryMetric = { label: 'Orders Received', value: 89 };
    } else if (req.user.role === 'FARMER') {
      dashboardData.title = 'Your Farm Growth';
    }

    res.json(dashboardData);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Trigger Weekly Summary
router.post('/send-weekly-summary', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || !user.email) return res.status(404).json({ error: 'User email not found' });

    // Mock stats for the demonstration
    const stats = {
      revenue: 35000,
      jobs: 2,
      diseases: 1,
      savings: 3500,
      healthScore: 94
    };

    await sendWeeklySummary(user.email, stats);
    res.json({ message: 'Weekly summary email sent' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send summary email' });
  }
});

export default router;
