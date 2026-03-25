import { Router } from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import Task from '../models/Task.js';
import User from '../models/User.js';
import VendorListing from '../models/VendorListing.js';

const router = Router();

// Get Analytics Dashboard (FARMER / ADMIN)
router.get('/', protect, authorize('FARMER', 'ADMIN'), async (req, res) => {
  try {
    // Enhanced Dashboard for ADMIN / FARMER
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
      mongoose.model('Vehicle').countDocuments({}),
      mongoose.model('Product').countDocuments({}),
      User.aggregate([
        { $group: { _id: "$role", count: { $sum: 1 } } }
      ])
    ]);

    const roleStats = {};
    userBreakdown.forEach(item => {
      roleStats[item._id] = item.count;
    });

    const dashboardData = {
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
        scansToday: 124, // Mock for now
        totalRevenue: 1250000,
        vehicles: vehicleCount,
        products: productCount,
        tasks: taskCount,
        roles: roleStats
      }
    };

    res.json(dashboardData);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

export default router;
