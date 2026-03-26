import { Router } from 'express';
import mongoose from 'mongoose';
import { protect, authorize, optionalProtect } from '../middleware/authMiddleware.js';
import VendorListing from '../models/VendorListing.js';
import User from '../models/User.js';
import PriceVote from '../models/PriceVote.js';
import { sendEmail, sendVendorOfferEmail } from '../utils/emailService.js';

const router = Router();

// 1. STATIC GET ROUTES (Must come before /:id)

// Get mock price trends for crops
router.get('/price-trends', protect, async (req, res) => {
  const trends = [
    { day: 'Mon', wheat: 2100, rice: 2400, tomato: 1800 },
    { day: 'Tue', wheat: 2150, rice: 2350, tomato: 1900 },
    { day: 'Wed', wheat: 2200, rice: 2450, tomato: 2200 },
    { day: 'Thu', wheat: 2180, rice: 2500, tomato: 2500 },
    { day: 'Fri', wheat: 2250, rice: 2550, tomato: 2400 },
    { day: 'Sat', wheat: 2300, rice: 2600, tomato: 2800 },
    { day: 'Sun', wheat: 2280, rice: 2580, tomato: 3000 },
  ];
  res.json(trends);
});

// Get Agreed Market Price (Daily average per crop)
router.get('/agreed-price', async (req, res) => {
  try {
    const date = new Date().toISOString().split('T')[0];
    const agreedPrices = await PriceVote.aggregate([
      { $match: { date } },
      { 
        $group: { 
          _id: "$crop", 
          avgPrice: { $avg: "$votedPrice" },
          voteCount: { $sum: 1 } 
        } 
      }
    ]);
    res.json(agreedPrices);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch agreed prices' });
  }
});

// Get Offers (VENDOR/ADMIN)
router.get('/my-offers', protect, authorize('VENDOR', 'ADMIN'), async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const query = req.user.role === 'ADMIN' ? {} : { 
      $or: [
        { 'offers.vendorId': userId },
        { farmerId: userId }
      ]
    };
    const listings = await VendorListing.find(query)
      .populate('farmerId', 'name district')
      .sort('-createdAt');
    
    // For Admin, return full listings. For Vendor, extract their own offers.
    if (req.user.role === 'ADMIN') {
      return res.json(listings.map(l => ({
        _id: l._id,
        crop: l.crop,
        farmer: l.farmerId,
        offersCount: l.offers.length,
        status: l.status,
        unitPrice: l.unitPrice
      })));
    }

    const results = listings.map(l => {
      const myOffer = l.offers.find(o => o.vendorId && o.vendorId.toString() === req.user.id);
      return {
        _id: l._id,
        crop: l.crop,
        farmer: l.farmerId,
        myOffer,
        status: l.status,
        unitPrice: l.unitPrice,
        quantityReq: l.quantityReq,
        district: l.district,
        imageUrl: l.imageUrl,
        isOwner: l.farmerId?._id?.toString() === req.user.id
      };
    });
    
    res.json(results);
  } catch (err) {
    console.error('[VENDOR] My Offers Error:', err);
    res.status(500).json({ error: 'Failed to fetch offers', details: err.message });
  }
});

// Get all listings (VENDORS Marketplace)
router.get('/', optionalProtect, async (req, res) => {
  try {
    const { district, crop, lat, lng } = req.query;
    // For demo, all listings are visible regardless of isVerified status
    let filterQuery = {};
    
    filterQuery.status = { $ne: 'sold' };
    if (district) filterQuery.district = district;
    if (crop) filterQuery.crop = { $regex: crop, $options: 'i' };

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    let listings;
    // Only use $geoNear if coordinates are valid AND collection exists with index
    const hasCoords = !isNaN(latitude) && !isNaN(longitude) && latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180;
    
    if (hasCoords) {
      try {
        const geoNearOptions = {
          near: { type: "Point", coordinates: [longitude, latitude] },
          distanceField: "distance",
          maxDistance: 10000000,
          spherical: true
        };
        if (Object.keys(filterQuery).length > 0) geoNearOptions.query = filterQuery;
        
        listings = await VendorListing.aggregate([
          { $geoNear: geoNearOptions },
          { $sort: { distance: 1 } }
        ]);
        // After aggregation, populate the results manually since aggregate returns POJOs
        listings = await VendorListing.populate(listings, { path: 'farmerId', select: 'name phone' });
      } catch (aggErr) {
        console.warn('[VENDOR] Aggregation failed (likely no index), falling back to find:', aggErr.message);
        listings = await VendorListing.find(filterQuery).populate('farmerId', 'name phone').sort('-createdAt');
      }
    } else {
      listings = await VendorListing.find(filterQuery).populate('farmerId', 'name phone').sort('-createdAt');
    }
    res.json(listings || []);
  } catch (err) {
    console.error('[VENDOR] Critical Error in GET /:', err);
    res.status(500).json({ error: 'Failed to fetch listings', details: err.message });
  }
});

// 2. PARAMETER GET ROUTES

router.get('/:id', optionalProtect, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: 'Invalid ID format' });
    const listing = await VendorListing.findById(req.params.id).populate('farmerId', 'name phone');
    if (!listing) return res.status(404).json({ error: 'Listing not found' });
    res.json(listing);
  } catch (err) {
    res.status(500).json({ error: 'Fetch failed', details: err.message });
  }
});

// 3. POST ROUTES

router.post(['/', '/list'], protect, authorize('FARMER', 'VENDOR', 'STORE_OWNER', 'ADMIN'), async (req, res) => {
  try {
    const { cropName, crop, name, title, quantity, quantityReq, stock, pricePerKg, unitPrice, price, location, district, imageUrl } = req.body;
    const listing = new VendorListing({
      farmerId: req.user.id,
      crop: crop || cropName || name || title,
      quantityReq: quantityReq || quantity || stock || 0,
      unitPrice: unitPrice || price || (pricePerKg ? pricePerKg * 100 : 0),
      district: district || (location && typeof location === 'string' ? location : 'Unknown'),
      imageUrl,
      status: 'open',
      location: location && location.coordinates ? location : undefined
    });
    await listing.save();
    res.status(201).json(listing);
  } catch (err) {
    console.error('[VENDOR] Create Error:', err);
    res.status(500).json({ error: 'Failed to create listing', details: err.message });
  }
});

router.post(['/offer', '/:id/offer'], protect, authorize('STORE_OWNER', 'VENDOR', 'FARMER', 'ADMIN'), async (req, res) => {
  try {
    const id = req.params.id || req.body.listingId;
    const offeredPrice = req.body.offeredPrice || req.body.bidPrice;
    if (!id) return res.status(400).json({ error: 'Listing ID required' });
    const listing = await VendorListing.findById(id);
    if (!listing || listing.status === 'sold') return res.status(400).json({ error: 'Listing not available' });
    listing.offers.push({ vendorId: req.user.id, offeredPrice, status: 'pending' });
    listing.status = 'negotiating';
    await listing.save();
    res.json(listing);
  } catch (err) {
    res.status(500).json({ error: 'Failed to make offer' });
  }
});

router.post('/price-vote', protect, authorize('FARMER'), async (req, res) => {
  try {
    const { crop, votedPrice, district } = req.body;
    const date = new Date().toISOString().split('T')[0];
    const vote = await PriceVote.findOneAndUpdate({ farmerId: req.user.id, crop, date }, { votedPrice, district }, { upsert: true, new: true });
    res.json(vote);
  } catch (err) {
    res.status(500).json({ error: 'Failed to cast vote' });
  }
});

// 4. PATCH ROUTES

router.patch('/:id/offers/:offerId', protect, authorize('FARMER', 'ADMIN'), async (req, res) => {
  try {
    const { status } = req.body;
    if (!['accepted', 'rejected'].includes(status)) return res.status(400).json({ error: 'Invalid status' });
    const listing = await VendorListing.findById(req.params.id);
    if (!listing) return res.status(404).json({ error: 'Listing not found' });
    if (listing.farmerId.toString() !== req.user.id && req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Unauthorized' });
    const offer = listing.offers.id(req.params.offerId);
    if (!offer) return res.status(404).json({ error: 'Offer not found' });
    offer.status = status;
    if (status === 'accepted') listing.status = 'sold';
    await listing.save();
    res.json(listing);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update offer' });
  }
});

router.patch('/verify/:id', protect, authorize('ADMIN'), async (req, res) => {
  try {
    const listing = await VendorListing.findByIdAndUpdate(req.params.id, { isVerified: true }, { new: true });
    if (!listing) return res.status(404).json({ error: 'Listing not found' });
    res.json(listing);
  } catch (err) {
    res.status(500).json({ error: 'Verification failed' });
  }
});

router.patch('/:id', protect, authorize('FARMER', 'VENDOR', 'STORE_OWNER', 'ADMIN'), async (req, res) => {
  try {
    const { offeredPrice } = req.body;
    
    // If user is a VENDOR, they are updating their OFFER, not the listing itself
    if (req.user.role === 'VENDOR') {
      const listing = await VendorListing.findOneAndUpdate(
        { _id: req.params.id, 'offers.vendorId': req.user.id },
        { $set: { 'offers.$.offeredPrice': offeredPrice } },
        { new: true }
      );
      if (!listing) return res.status(404).json({ error: 'Listing or Offer not found' });
      return res.json(listing);
    }

    // Otherwise, they are updating the listing (FARMER/ADMIN/STORE_OWNER as seller)
    const query = req.user.role === 'ADMIN' ? { _id: req.params.id } : { _id: req.params.id, farmerId: req.user.id };
    const listing = await VendorListing.findOneAndUpdate(query, req.body, { new: true });
    if (!listing) return res.status(404).json({ error: 'Listing not found' });
    res.json(listing);
  } catch (err) {
    console.error('[VENDOR] Update Error:', err);
    res.status(500).json({ error: 'Update failed', details: err.message });
  }
});

// 5. DELETE ROUTES

router.delete('/:id', protect, authorize('FARMER', 'VENDOR', 'ADMIN'), async (req, res) => {
  try {
    const query = req.user.role === 'ADMIN' ? { _id: req.params.id } : { _id: req.params.id, farmerId: req.user.id };
    await VendorListing.findOneAndDelete(query);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Delete failed' });
  }
});

export default router;
