import { Router } from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import Vehicle from '../models/Vehicle.js';
import VehicleBooking from '../models/VehicleBooking.js';

const router = Router();

// Get My Vehicles (VEHICLE_OWNER or ADMIN)
router.get('/my', protect, authorize('VEHICLE_OWNER', 'ADMIN'), async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ ownerId: req.user.id });
    res.json(vehicles);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch my vehicles' });
  }
});

// Get all available vehicles
router.get('/', async (req, res) => {
  try {
    const { type, district } = req.query;
    let query = { available: true };
    if (type) query.type = type;
    if (district) query.district = district;

    const vehicles = await Vehicle.find(query).populate('ownerId', 'name phone').sort('-rating');
    res.json(vehicles);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch vehicles' });
  }
});

// Add a new vehicle (VEHICLE_OWNER or ADMIN)
router.post('/', protect, authorize('VEHICLE_OWNER', 'ADMIN'), async (req, res) => {
  try {
    const vehicle = new Vehicle({
      ...req.body,
      ownerId: req.user.id
    });
    await vehicle.save();
    res.status(201).json(vehicle);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add vehicle' });
  }
});

// Book a vehicle (FARMER or ADMIN)
router.post('/book', protect, authorize('FARMER', 'ADMIN'), async (req, res) => {
  try {
    const { vehicleId, startDate, endDate, hours, totalAmount, depositAmount } = req.body;
    
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
    res.status(201).json(booking);
  } catch (err) {
    res.status(500).json({ error: 'Failed to book vehicle' });
  }
});

export default router;
