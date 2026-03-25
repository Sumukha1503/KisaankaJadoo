import { Router } from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import Labour from '../models/Labour.js';
import Task from '../models/Task.js';
import Booking from '../models/Booking.js';
import QRCode from 'qrcode';

const router = Router();

// Post a new task
router.post('/task', protect, authorize('FARMER', 'ADMIN'), async (req, res) => {
  try {
    const { taskType, date, workersNeeded, budget, district, lat, lng } = req.body;
    const task = new Task({
      farmerId: req.user.id,
      taskType,
      date,
      workersNeeded,
      budget,
      district,
      location: { type: 'Point', coordinates: [lng, lat] }
    });
    await task.save();
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// Geo-location based matching algorithm
router.get('/match', protect, authorize('FARMER', 'ADMIN'), async (req, res) => {
  try {
    const { taskType, district, date, lat, lng } = req.query;
    if (!lat || !lng) return res.status(400).json({ error: 'Lat/Lng required' });

    const matches = await Labour.aggregate([
      { $match: { skills: { $in: [taskType] } } }, // Can add district filtering here
      {
        $addFields: {
          distance: {
            $function: {
              body: function(lon1, lat1, lon2, lat2) {
                // Approximate distance using simple formula (MVP logic)
                // In production, use $geoNear pipeline
                const R = 6371e3;
                if (!lon1 || !lat1) return 999999;
                const r1 = lat1 * Math.PI/180;
                const r2 = lat2 * Math.PI/180;
                const dLat = (lat2-lat1) * Math.PI/180;
                const dLon = (lon2-lon1) * Math.PI/180;
                const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                          Math.cos(r1) * Math.cos(r2) *
                          Math.sin(dLon/2) * Math.sin(dLon/2);
                const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
                return R * c; 
              },
              args: [
                { $arrayElemAt: ["$location.coordinates", 0] },
                { $arrayElemAt: ["$location.coordinates", 1] },
                parseFloat(lng),
                parseFloat(lat)
              ],
              lang: "js"
            }
          }
        }
      },
      // { $match: { availability: { $elemMatch: { $gte: new Date(date) } } } }, MVP: removing availability block for test
      { $sort: { rating: -1, distance: 1 } },
      { $limit: 10 }
    ]);

    res.json(matches);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Matching failed' });
  }
});

// Get My Tasks (FARMER or ADMIN)
router.get('/tasks/my', protect, authorize('FARMER', 'ADMIN'), async (req, res) => {
  try {
    const tasks = await Task.find({ farmerId: req.user.id }).sort('-createdAt');
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch my tasks' });
  }
});

// Update Task Status
router.patch('/task/:id', protect, authorize('FARMER', 'ADMIN'), async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate({ _id: req.params.id, farmerId: req.user.id }, req.body, { new: true });
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// Book Labour
router.post('/book', protect, authorize('FARMER', 'ADMIN'), async (req, res) => {
  try {
    const { taskId, labourId, depositAmount } = req.body;
    
    // Generate QR Content
    const qrData = `kisanka:${taskId}:${labourId}:${Date.now()}`;
    const qrUrl = await QRCode.toDataURL(qrData);

    const booking = new Booking({
      taskId,
      farmerId: req.user.id,
      labourId,
      depositAmount,
      attendanceQr: qrUrl,
      paymentStatus: 'paid' // Assuming razorpay success before calling this
    });

    await booking.save();
    
    // Update task
    await Task.findByIdAndUpdate(taskId, { status: 'booked' });

    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: 'Failed to book labour' });
  }
});

export default router;