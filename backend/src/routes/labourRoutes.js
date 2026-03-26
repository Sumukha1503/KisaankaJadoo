import { Router } from 'express';
import mongoose from 'mongoose';
import { protect, authorize, optionalProtect } from '../middleware/authMiddleware.js';
import Labour from '../models/Labour.js';
import Task from '../models/Task.js';
import Booking from '../models/Booking.js';
import Invite from '../models/Invite.js';
import User from '../models/User.js';
import QRCode from 'qrcode';
import { sendBookingEmail, sendTaskCreatedEmail, sendEmail, sendInviteStatusEmail, sendNewJobAlert, sendWeeklySummary } from '../utils/emailService.js';

const router = Router();

// Post a new task
router.post('/task', protect, authorize('FARMER', 'ADMIN'), async (req, res) => {
  try {
    const { taskType, date, workersNeeded, budget, district, lat, lng, location } = req.body;
    
    // Extract coordinates from top-level or nested location object
    let latitude = parseFloat(lat);
    let longitude = parseFloat(lng);
    
    if (isNaN(latitude) || isNaN(longitude)) {
      if (location?.coordinates) {
        longitude = parseFloat(location.coordinates[0]);
        latitude = parseFloat(location.coordinates[1]);
      }
    }
    
    // Validate coordinates or use fallback
    if (isNaN(longitude) || isNaN(latitude)) {
       console.warn(`Missing coordinates for task ${taskType}, using default Hassan coordinates.`);
       longitude = 76.1004; // Default Hassan Lng
       latitude = 13.0033;  // Default Hassan Lat
    }

    if (longitude < -180 || longitude > 180 || latitude < -90 || latitude > 90) {
       return res.status(400).json({ error: 'Coordinates are out of range. Longitude must be -180 to 180, Latitude must be -90 to 90.' });
    }

    const task = new Task({
      farmerId: req.user.id,
      taskType: taskType || 'general',
      date: date || new Date(),
      workersNeeded: parseInt(workersNeeded) || 1,
      budget: parseInt(budget) || 0,
      district: district || 'Nearby',
      location: { type: 'Point', coordinates: [longitude, latitude] }
    });
    
    await task.save();

    // Notify Farmer
    try {
      const user = await User.findById(req.user.id);
      if (user?.email) {
        await sendTaskCreatedEmail(user.email, {
          taskType: task.taskType,
          budget: task.budget,
          workersNeeded: task.workersNeeded,
          district: task.district
        });
        
        // Broadcast to nearby workers
        const nearbyWorkers = await Labour.find({ district: task.district, isReady: true }).populate('userId');
        nearbyWorkers.forEach(worker => {
          if (worker.userId?.email) {
            sendNewJobAlert(worker.userId.email, {
              taskType: task.taskType,
              location: task.district,
              wage: Math.round(task.budget / task.workersNeeded),
              date: new Date(task.date).toLocaleDateString()
            }).catch(e => console.error('Job broadcast failed:', e.message));
          }
        });
      }
    } catch (emailErr) {
      console.error('Task notification flow failed:', emailErr);
    }

    res.status(201).json(task);
  } catch (err) {
    console.error('Task creation ERROR:', err.message);
    res.status(500).json({ error: 'Failed to create task', details: err.message });
  }
});

// Geo-location based matching algorithm
router.get('/match', protect, authorize('FARMER', 'ADMIN'), async (req, res) => {
  try {
    const { taskType, district, date, lat, lng } = req.query;
    const longitude = parseFloat(lng);
    const latitude = parseFloat(lat);

    const hasCoords = !isNaN(latitude) && !isNaN(longitude) && latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180;
    let matches;

    if (hasCoords) {
      try {
        const geoNearOptions = {
          near: { type: "Point", coordinates: [longitude, latitude] },
          distanceField: "distance",
          maxDistance: 100000, 
          spherical: true
        };
        const query = {};
        if (taskType) query.skills = { $in: [taskType] };
        geoNearOptions.query = query;

        matches = await Labour.aggregate([
          { $geoNear: geoNearOptions },
          { $sort: { distance: 1 } }
        ]);
      } catch (aggErr) {
        console.warn('[LABOUR] Aggregation failed, falling back to find:', aggErr.message);
        const query = {};
        if (taskType) query.skills = { $in: [taskType] };
        matches = await Labour.find(query);
      }
    } else {
      const query = {};
      if (taskType) query.skills = { $in: [taskType] };
      matches = await Labour.find(query);
    }

    res.json(matches || []);
  } catch (err) {
    console.error('[LABOUR] Matching Error:', err);
    res.status(500).json({ error: 'Matching failed', details: err.message });
  }
});

// Get Tasks (Owned by FARMER or ALL for ADMIN)
// Get Tasks (Owned by FARMER, VENDOR or ALL for ADMIN)
router.get('/tasks/my', protect, authorize('FARMER', 'VENDOR', 'ADMIN'), async (req, res) => {
  try {
    const query = req.user.role === 'ADMIN' ? {} : { farmerId: req.user.id };
    const tasks = await Task.find(query).sort('-createdAt');
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// Delete Task
// Delete Task (FARMER, VENDOR or ADMIN)
router.delete('/task/:id', protect, authorize('FARMER', 'VENDOR', 'ADMIN'), async (req, res) => {
  try {
    const query = req.user.role === 'ADMIN' ? { _id: req.params.id } : { _id: req.params.id, farmerId: req.user.id };
    const task = await Task.findOneAndDelete(query);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Delete failed' });
  }
});


// Update Task Status
// Update Task Status (FARMER, VENDOR or ADMIN)
router.patch('/task/:id', protect, authorize('FARMER', 'VENDOR', 'ADMIN'), async (req, res) => {
  try {
    const query = req.user.role === 'ADMIN' ? { _id: req.params.id } : { _id: req.params.id, farmerId: req.user.id };
    const task = await Task.findOneAndUpdate(query, req.body, { new: true });
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

    // Send confirmation email
    try {
      const user = await User.findById(req.user.id);
      const task = await Task.findById(taskId);
      if (user?.email) {
        await sendBookingEmail(user.email, {
          id: booking._id,
          userName: user.name,
          type: `Labour for ${task?.taskType || 'Task'}`,
          date: new Date(task?.date || Date.now()).toLocaleDateString(),
          amount: depositAmount
        });

        // Notify Labourer
        const labourer = await User.findById(labourId);
        if (labourer?.email) {
          await sendEmail(
            labourer.email,
            'New Job Booking! - KisaanKaJadoo',
            `Hello ${labourer.name},\n\nYou have been booked for a task: "${task?.taskType}".\nLocation: ${task?.district}\nDate: ${new Date(task?.date || Date.now()).toLocaleDateString()}\n\nPlease log in to view details and contact the farmer.`
          );
        }
      }
    } catch (emailErr) {
      console.error('Labour booking emails failed:', emailErr);
    }

    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: 'Failed to book labour' });
  }
});

// Get all open tasks (for Labourers to find work)
router.get('/tasks/all', protect, authorize('LABOUR', 'ADMIN'), async (req, res) => {
  try {
    const { lat, lng } = req.query;
    const query = { status: 'open' };

    let tasks;
    const hasCoords = lat && lng && !isNaN(parseFloat(lat)) && !isNaN(parseFloat(lng));
    
    if (hasCoords) {
      try {
        tasks = await Task.aggregate([
          {
            $geoNear: {
              near: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
              distanceField: "distance",
              maxDistance: 10000000,
              query: query,
              spherical: true
            }
          },
          { $sort: { distance: 1 } }
        ]);
        tasks = await Task.populate(tasks, { path: 'farmerId', select: 'name district' });
      } catch (aggErr) {
        console.warn('[LABOUR] Task aggregation failed, falling back to find:', aggErr.message);
        tasks = await Task.find(query).populate('farmerId', 'name district').sort('-createdAt');
      }
    } else {
      tasks = await Task.find(query).populate('farmerId', 'name district').sort('-createdAt');
    }
    res.json(tasks || []);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// Labourer expresses interest in a task ("Send Invite")
router.post('/task/:id/invite', protect, authorize('LABOUR', 'ADMIN'), async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    
    // Check if invite already exists
    const existingInvite = await Invite.findOne({ taskId: task._id, labourId: req.user.id });
    if (existingInvite) return res.status(400).json({ error: 'Invite already sent' });

    // Link the specific labour profile if it exists
    const labourProfile = await Labour.findOne({ userId: req.user.id });

    const invite = new Invite({
      taskId: task._id,
      farmerId: task.farmerId,
      labourId: req.user.id,
      labourProfileId: labourProfile?._id,
      status: 'pending'
    });

    await invite.save();

    // Notify Farmer about interest
    try {
      const farmer = await User.findById(task.farmerId);
      const labour = await User.findById(req.user.id);
      if (farmer?.email) {
        await sendEmail(
          farmer.email,
          'Interest Received for Your Task',
          `Hello ${farmer.name},\n\nLabourer ${labour?.name || 'Worker'} has expressed interest in your task "${task.taskType}".\n\nLogin to KisaanKaJadoo to review and confirm!`,
          `<div style="font-family: Arial, sans-serif; padding: 20px;">
             <h2 style="color: #2e7d32;">New Interest Received!</h2>
             <p>A worker is ready to help with your task: <strong>${task.taskType}</strong></p>
             <p>Worker: <strong>${labour?.name || 'Worker'}</strong></p>
             <p>Login to your dashboard to review the invite and confirm the booking.</p>
           </div>`
        );
      }
    } catch (emailErr) {
      console.error('Invite email failed:', emailErr);
    }

    res.json({ success: true, message: 'Invite sent to farmer!', taskId: task._id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send invite' });
  }
});

// Get Invites (Received by FARMER or Sent by LABOUR)
router.get('/invites/my', protect, authorize('FARMER', 'LABOUR', 'ADMIN'), async (req, res) => {
  try {
    const query = req.user.role === 'FARMER' ? { farmerId: req.user.id } : { labourId: req.user.id };
    const invites = await Invite.find(query)
      .populate('taskId')
      .populate('labourId', 'name phone')
      .populate('farmerId', 'name phone')
      .sort('-createdAt');
    res.json(invites);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch invites' });
  }
});

// Update Invite Status
router.patch('/invite/:id/status', protect, authorize('FARMER', 'LABOUR', 'ADMIN'), async (req, res) => {
  try {
    const { status } = req.body;
    const query = req.user.role === 'FARMER' ? { _id: req.params.id, farmerId: req.user.id } : { _id: req.params.id, labourId: req.user.id };
    const invite = await Invite.findOneAndUpdate(
      query,
      { status },
      { new: true }
    );
    if (!invite) return res.status(404).json({ error: 'Invite found' });
    
    // Notify Labourer about status update
    try {
      const labourer = await User.findById(invite.labourId);
      const farmer = await User.findById(invite.farmerId);
      const task = await Task.findById(invite.taskId);
      
      if (labourer?.email) {
        await sendInviteStatusEmail(labourer.email, {
          status: status,
          taskType: task?.taskType || 'Farm Task',
          farmerName: farmer?.name || 'Farmer',
          farmerPhone: farmer?.phone || 'N/A'
        });
      }
    } catch (err) { console.error('Invite status email failed:', err); }

    res.json(invite);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update invite' });
  }
});

// Toggle Ready status (Labour only)
router.patch('/ready', protect, authorize('LABOUR', 'ADMIN'), async (req, res) => {
  try {
    const { isReady } = req.body;
    let labour = await Labour.findOne({ userId: req.user.id });
    
    if (!labour) {
      // Fetch user to get name/phone
      const user = await User.findById(req.user.id);
      
      // If profile missing, create one with defaults
      labour = new Labour({
        userId: req.user.id,
        name: user?.name || 'Worker',
        phone: user?.phone || '0000000000',
        skills: ['general'],
        wage: 500,
        district: 'Nearby',
        location: { type: 'Point', coordinates: [0, 0] },
        isReady: isReady
      });
      await labour.save();
    } else {
      labour.isReady = isReady;
      await labour.save();
    }
    
    res.json(labour);
  } catch (err) {
    res.status(500).json({ error: 'Toggle failed' });
  }
});

// Get available labourers (Farmers see ready/verified, Admin sees all, Owner sees self)
router.get('/available', optionalProtect, authorize('FARMER', 'ADMIN', 'LABOUR'), async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'ADMIN') {
      query = {};
    } else if (req.user && req.user.id && req.user.role === 'LABOUR') {
      query.$or = [{ isReady: true, verified: true }, { userId: new mongoose.Types.ObjectId(req.user.id) }];
    } else {
      query = { isReady: true, verified: true };
    }
    const labourers = await Labour.find(query).sort('-rating');
    res.json(labourers);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch workers' });
  }
});

// Farmer invites a specific labourer
router.post('/invite-labourer', protect, authorize('FARMER', 'ADMIN'), async (req, res) => {
  try {
    const { labourId, taskId } = req.body;
    
    // Check if task exists
    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    // Check if invite already exists
    const existingInvite = await Invite.findOne({ taskId, labourId, farmerId: req.user.id });
    if (existingInvite) return res.status(400).json({ error: 'Invite already sent' });

    const invite = new Invite({
      taskId,
      farmerId: req.user.id,
      labourId, // This is the user ID of the labourer
      status: 'pending'
    });

    await invite.save();
    res.status(201).json(invite);
  } catch (err) {
    res.status(500).json({ error: 'Failed to invite worker' });
  }
});

// Mark a task as completed (Farmer or Admin)
router.patch('/tasks/:id/complete', protect, authorize('FARMER', 'ADMIN'), async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    // Ensure only the farmer who created the task or an admin can complete it
    if (req.user.role === 'FARMER' && task.farmerId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to complete this task' });
    }

    task.status = 'completed';
    await task.save();

    // Notify Farmer of completion and wage summary
    const farmer = await User.findById(task.farmerId);
    if (farmer?.email) {
      const summaryHtml = `
        <div style="font-family: sans-serif; padding: 25px; border-radius: 12px; border: 1px solid #eee;">
          <h2 style="color: #2e7d32;">Task Completed! 🚜</h2>
          <p>Your task <strong>${task.taskType}</strong> is finished.</p>
          <div style="background: #f1f8e9; padding: 15px; border-radius: 8px;">
            <p><strong>Total Workers:</strong> ${task.workersNeeded}</p>
            <p><strong>Total Budget:</strong> ₹${task.budget}</p>
          </div>
          <p>Thank you for using KisaanKaJadoo!</p>
        </div>
      `;
      sendEmail(farmer.email, `Task Completed: ${task.taskType} ✅`, `Task ${task.taskType} completed. Budget: ₹${task.budget}`, summaryHtml).catch(e => console.error('Job summary failed'));
    }

    res.json(task);
  } catch (err) {
    res.status(500).json({ error: 'Failed to complete task' });
  }
});


// Get current labourer's profile
router.get('/my-profile', protect, authorize('LABOUR', 'ADMIN'), async (req, res) => {
  try {
    const labour = await Labour.findOne({ userId: req.user.id });
    if (!labour) return res.status(200).json(null); 
    res.json(labour);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update labourer's profile
router.patch('/my-profile', protect, authorize('LABOUR', 'ADMIN'), async (req, res) => {
  try {
    const labour = await Labour.findOneAndUpdate(
      { userId: req.user.id },
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!labour) return res.status(404).json({ error: 'Profile not found' });
    res.json(labour);
  } catch (err) {
    res.status(500).json({ error: 'Update failed' });
  }
});

// Verify Labourer (Admin only)
router.patch('/verify/:id', protect, authorize('ADMIN'), async (req, res) => {
  try {
    const labour = await Labour.findByIdAndUpdate(req.params.id, { verified: true }, { new: true });
    if (!labour) return res.status(404).json({ error: 'Labour profile not found' });
    res.json(labour);
  } catch (err) {
    res.status(500).json({ error: 'Verification failed' });
  }
});

export default router;
