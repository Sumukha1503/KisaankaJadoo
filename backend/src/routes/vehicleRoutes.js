import { Router } from 'express';
import mongoose from 'mongoose';
import { protect, authorize, optionalProtect } from '../middleware/authMiddleware.js';
import Vehicle from '../models/Vehicle.js';
import VehicleBooking from '../models/VehicleBooking.js';
import User from '../models/User.js';
import { sendBookingEmail, sendEmail } from '../utils/emailService.js';

const router = Router();

// Get Vehicles (Owned or ALL for ADMIN)
// Get my vehicles (VEHICLE_OWNER, FARMER or ADMIN)
router.get('/my', protect, authorize('VEHICLE_OWNER', 'FARMER', 'ADMIN'), async (req, res) => {
  try {
    const query = req.user.role === 'ADMIN' ? {} : { ownerId: req.user.id };
    const vehicles = await Vehicle.find(query).sort('-createdAt').lean();
    
    // Fetch last booking for each vehicle to show who rented it
    const vehiclesWithBookings = await Promise.all(vehicles.map(async (v) => {
      if (!v.available) {
        const lastBooking = await VehicleBooking.findOne({ vehicleId: v._id })
          .sort('-createdAt')
          .populate('farmerId', 'name phone')
          .lean();
        return { ...v, lastBooking };
      }
      return v;
    }));

    res.json(vehiclesWithBookings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch vehicles' });
  }
});

// Update vehicle (VEHICLE_OWNER, FARMER or ADMIN)
router.patch('/:id', protect, authorize('VEHICLE_OWNER', 'FARMER', 'ADMIN'), async (req, res) => {
  try {
    const query = req.user.role === 'ADMIN' ? { _id: req.params.id } : { _id: req.params.id, ownerId: req.user.id };
    const vehicle = await Vehicle.findOneAndUpdate(query, req.body, { new: true });
    res.json(vehicle);
  } catch (err) {
    res.status(500).json({ error: 'Update failed' });
  }
});

// Delete Vehicle
// Delete Vehicle (VEHICLE_OWNER, FARMER or ADMIN)
router.delete('/:id', protect, authorize('VEHICLE_OWNER', 'FARMER', 'ADMIN'), async (req, res) => {
  try {
    const query = req.user.role === 'ADMIN' ? { _id: req.params.id } : { _id: req.params.id, ownerId: req.user.id };
    await Vehicle.findOneAndDelete(query);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Delete failed' });
  }
});


// Get single vehicle
router.get('/:id', optionalProtect, async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id).populate('ownerId', 'name phone');
    if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });
    res.json(vehicle);
  } catch (err) {
    res.status(500).json({ error: 'Fetch failed' });
  }
});

// Get all available vehicles
router.get('/', optionalProtect, async (req, res) => {
  try {
    const { type, district, lat, lng } = req.query;
    // Only return verified and available vehicles to the public, but owners see their own items
    // All items are visible for demo purposes
    let query = { available: true };
    if (type) query.type = type;
    if (district) query.district = district;

    let vehicles;
    if (lat && lng) {
      const parsedLat = parseFloat(lat);
      const parsedLng = parseFloat(lng);
      
      if (isNaN(parsedLat) || isNaN(parsedLng)) {
        return res.status(400).json({ error: 'Invalid coordinates provided' });
      }

      try {
        vehicles = await Vehicle.aggregate([
          {
            $geoNear: {
              near: { type: "Point", coordinates: [parsedLng, parsedLat] },
              distanceField: "distance",
              maxDistance: 10000000,
              query: query,
              spherical: true
            }
          },
          { $sort: { distance: 1 } }
        ]);
        vehicles = await Vehicle.populate(vehicles, { path: 'ownerId', select: 'name phone' });
      } catch (aggErr) {
        console.warn('[VEHICLE] Aggregation failed, falling back to find:', aggErr.message);
        vehicles = await Vehicle.find(query).populate('ownerId', 'name phone').sort('-rating');
      }
    } else {
      vehicles = await Vehicle.find(query).populate('ownerId', 'name phone').sort('-rating');
    }
    res.json(vehicles);
  } catch (err) {
    console.error('Fetch Vehicles Error:', err);
    res.status(500).json({ error: 'Failed to fetch vehicles' });
  }
});

// Add a new vehicle (VEHICLE_OWNER, FARMER or ADMIN)
router.post('/', protect, authorize('VEHICLE_OWNER', 'FARMER', 'ADMIN'), async (req, res) => {
  try {
    const { price, ratePerHour } = req.body;
    const vehicle = new Vehicle({
      ...req.body,
      ratePerHour: ratePerHour || price,
      ownerId: req.user.id,
      location: req.body.location && req.body.location.coordinates ? req.body.location : undefined
    });
    await vehicle.save();
    res.status(201).json(vehicle);
  } catch (err) {
    console.error('Add Vehicle Error:', err);
    res.status(500).json({ error: 'Failed to add vehicle' });
  }
});

// Book a vehicle (FARMER or ADMIN)
router.post('/book', protect, authorize('FARMER', 'ADMIN'), async (req, res) => {
  try {
    const { 
      vehicleId, 
      startDate = new Date(), 
      endDate = new Date(Date.now() + 86400000), 
      hours = 24, 
      totalAmount = 0, 
      depositAmount = 0 
    } = req.body;
    
    // In MVP, we just create the booking. In prod, verify Razorpay signature here before saving.
    const booking = new VehicleBooking({
      vehicleId,
      farmerId: req.user.id,
      startDate,
      endDate,
      hours,
      totalAmount,
      depositAmount,
      paymentStatus: 'paid' // Assuming frontend handles Razorpay success before calling this
    });

    await booking.save();

    // Mark vehicle as unavailable
    await Vehicle.findByIdAndUpdate(vehicleId, { available: false });

    // Send confirmation email
    try {
      const user = await User.findById(req.user.id);
      const vehicle = await Vehicle.findById(vehicleId);
      if (user?.email) {
        await sendBookingEmail(user.email, {
          id: booking._id,
          userName: user.name,
          type: vehicle?.type || 'Vehicle',
          date: new Date(startDate).toLocaleDateString(),
          amount: totalAmount
        });

        // Notify Owner
        const owner = await User.findById(vehicle.ownerId);
        if (owner?.email) {
          await sendEmail(
            owner.email,
            'Your Vehicle has been Booked! - KisaanKaJadoo',
            `Hello ${owner.name},\n\nYour ${vehicle.type} (${vehicle.model}) has been booked by ${user.name} for ${new Date(startDate).toLocaleDateString()}.\n\nTotal Earnings: ₹${totalAmount}\n\nPlease check your dashboard for details.`
          );
        }
      }
    } catch (emailErr) {
      console.error('Booking emails failed:', emailErr);
    }

    res.status(201).json(booking);
  } catch (err) {
    res.status(500).json({ error: 'Failed to book vehicle' });
  }
});

// Verify Vehicle (ADMIN only)
router.patch('/verify/:id', protect, authorize('ADMIN'), async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, { isVerified: true }, { new: true });
    if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });
    res.json(vehicle);
  } catch (err) {
    res.status(500).json({ error: 'Verification failed' });
  }
});

export default router;
