import { Router } from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import VendorListing from '../models/VendorListing.js';

const router = Router();

// Get all listings (VENDORS)
router.get('/', async (req, res) => {
  try {
    const { crop, district } = req.query;
    let query = { status: 'open' };
    if (crop) query.crop = crop;
    if (district) query.district = district;

    const listings = await VendorListing.find(query).populate('farmerId', 'name district').sort('-createdAt');
    res.json(listings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch listings' });
  }
});

// Create listing (FARMER/VENDOR/ADMIN) - Alias /list
router.post(['/', '/list'], protect, authorize('FARMER', 'VENDOR', 'STORE_OWNER', 'ADMIN'), async (req, res) => {
  try {
    const { cropName, crop, quantity, quantityReq, pricePerKg, unitPrice, location, district, imageUrl } = req.body;
    
    const listing = new VendorListing({
      farmerId: req.user.id,
      crop: crop || cropName,
      quantityReq: quantityReq || quantity || 0,
      unitPrice: unitPrice || (pricePerKg ? pricePerKg * 100 : 0), // Assuming per quintal vs per kg
      district: district || location || 'Unknown',
      imageUrl,
      status: 'open'
    });

    await listing.save();
    res.status(201).json(listing);
  } catch (err) {
    console.error('Create Listing Error:', err);
    res.status(500).json({ error: 'Failed to create listing', details: err.message });
  }
});

// Make an offer (VENDOR) - Alias /offer
router.post(['/offer', '/:id/offer'], protect, authorize('STORE_OWNER', 'VENDOR', 'ADMIN'), async (req, res) => {
  try {
    const id = req.params.id || req.body.listingId;
    const offeredPrice = req.body.offeredPrice || req.body.bidPrice;

    if (!id) return res.status(400).json({ error: 'Listing ID required' });

    const listing = await VendorListing.findById(id);
    
    if (!listing || listing.status === 'sold') {
      return res.status(400).json({ error: 'Listing not available' });
    }

    listing.offers.push({
      vendorId: req.user.id,
      offeredPrice,
      status: 'pending'
    });
    
    listing.status = 'negotiating';
    await listing.save();

    res.json(listing);
  } catch (err) {
    res.status(500).json({ error: 'Failed to make offer' });
  }
});

// Get My Offers (VENDOR or ADMIN)
router.get('/my-offers', protect, authorize('VENDOR', 'ADMIN'), async (req, res) => {
  try {
    const listings = await VendorListing.find({ 'offers.vendorId': req.user.id })
      .populate('farmerId', 'name district')
      .sort('-createdAt');
    
    // Extract only the vendor's own offers from each listing for cleaner frontend
    const results = listings.map(l => {
      const myOffer = l.offers.find(o => o.vendorId.toString() === req.user.id);
      return {
        _id: l._id,
        crop: l.crop,
        farmer: l.farmerId,
        myOffer,
        status: l.status
      };
    });
    
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch my offers' });
  }
});

export default router;
