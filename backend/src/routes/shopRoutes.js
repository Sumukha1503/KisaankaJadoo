import { Router } from 'express';
import mongoose from 'mongoose';
import { protect, authorize, optionalProtect } from '../middleware/authMiddleware.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import User from '../models/User.js';
import { sendEmail, sendNewOrderEmail, sendOrderStatusEmail, sendOrderConfirmationEmail, sendDetailedOrderInvoice } from '../utils/emailService.js';

const router = Router();

// Get Products (Owned by STORE_OWNER or ALL for ADMIN)
router.get('/products/my', protect, authorize('STORE_OWNER', 'ADMIN'), async (req, res) => {
  try {
    const query = req.user.role === 'ADMIN' ? {} : { storeOwnerId: req.user.id };
    const products = await Product.find(query).sort('-createdAt');
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Update Product
router.patch('/products/:id', protect, authorize('STORE_OWNER', 'ADMIN'), async (req, res) => {
  try {
    const query = req.user.role === 'ADMIN' ? { _id: req.params.id } : { _id: req.params.id, storeOwnerId: req.user.id };
    const product = await Product.findOneAndUpdate(query, req.body, { new: true });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: 'Update failed' });
  }
});

// Delete Product
router.delete('/products/:id', protect, authorize('STORE_OWNER', 'ADMIN', 'VENDOR'), async (req, res) => {
  try {
    const query = req.user.role === 'ADMIN' ? { _id: req.params.id } : { _id: req.params.id, storeOwnerId: req.user.id };
    const product = await Product.findOneAndDelete(query);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Delete failed' });
  }
});


// Get single product
router.get('/products/:id', optionalProtect, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('storeOwnerId', 'name phone');
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: 'Fetch failed' });
  }
});

// Get all products (General marketplace)
router.get('/products', optionalProtect, async (req, res) => {
  try {
    const { category, search, lat, lng } = req.query;
    
    // Base query for products (must be in stock)
    let baseQuery = { stock: { $gt: 0 } };

    // Apply verification logic: public sees only verified, owner sees their own unverified too
    if (req.user && req.user.id) {
      baseQuery.$or = [{ isVerified: true }, { storeOwnerId: new mongoose.Types.ObjectId(req.user.id) }];
    } else {
      baseQuery.isVerified = true;
    }

    // Combine with category and search filters
    if (category) baseQuery.category = category;
    if (search) baseQuery.name = { $regex: search, $options: 'i' };

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    console.log(`[SHOP] Parsed coords: lat=${latitude}, lng=${longitude}`);

    let products;
    // Strict range check for coordinates to prevent MongoDB errors
    if (!isNaN(latitude) && !isNaN(longitude) && latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180) {
      console.log(`[SHOP] Using GeoNear aggregation...`);
      const geoNearOptions = {
        near: { type: "Point", coordinates: [longitude, latitude] },
        distanceField: "distance",
        maxDistance: 100000, // 100km radius for better results
        spherical: true
      };
      // Only include query if there are filters to avoid empty object issues
      if (Object.keys(baseQuery).length > 0) geoNearOptions.query = baseQuery;

      products = await Product.aggregate([
        { $geoNear: geoNearOptions },
        { $sort: { distance: 1 } }
      ]).then(docs => Product.populate(docs, { path: 'storeOwnerId', select: 'name phone' }));
    } else {
      console.log(`[SHOP] Falling back to standard find...`);
      products = await Product.find(baseQuery).populate('storeOwnerId', 'name phone').sort('-createdAt');
    }
    console.log(`[SHOP] Found ${products.length} products`);
    res.json(products);
  } catch (err) {
    console.error('[SHOP] Critical Error:', err);
    res.status(500).json({ error: 'Failed to fetch products', details: err.message, stack: err.stack });
  }
});

// Store Owner: Add new product
router.post('/products', protect, authorize('STORE_OWNER', 'ADMIN'), async (req, res) => {
  try {
    const product = new Product({
      ...req.body,
      storeOwnerId: req.user.id
    });
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    console.error('Add product error:', err.message);
    res.status(500).json({ error: 'Failed to create product', details: err.message });
  }
});

// Create Order (Farmer checkout)
router.post('/orders', protect, authorize('FARMER'), async (req, res) => {
  try {
    const { items, totalAmount, paymentMethod, shippingAddress, storeOwnerId } = req.body;
    
    // In production, we'd verify totalAmount matches actual product prices from DB
    // and deduct stock. For MVP, we skip complex stock deduction in transaction.
    
    // Generate a unique tracking ID
    const trackingId = `KKJ-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    const order = new Order({
      farmerId: req.user.id,
      storeOwnerId,
      items,
      totalAmount,
      paymentMethod: 'COD', // Default to COD for this workflow
      paymentStatus: 'PENDING',
      shippingAddress,
      trackingId
    });
    
    await order.save();

    // Notify Farmer
    try {
      const user = await User.findById(req.user.id);
      if (user?.email) {
        await sendDetailedOrderInvoice(user.email, {
          userName: user.name,
          trackingId: order.trackingId,
          amount: totalAmount,
          items: items.map(i => ({ name: i.productId?.name || 'Item', quantity: i.quantity, price: i.priceAtTime || 0 })),
          address: shippingAddress,
          paymentMethod: 'Cash on Delivery (COD)',
          eta: '3-4 Days'
        });
      }
      
      // Notify Store Owner
      const storeOwner = await User.findById(storeOwnerId);
      if (storeOwner?.email) {
        await sendNewOrderEmail(storeOwner.email, {
          customerName: user?.name || 'A Farmer',
          amount: totalAmount,
          address: shippingAddress
        });
      }

      // Inventory Alert Check
      for (const item of items) {
        // Assuming item.productId is populated or contains enough info to query Product
        const product = await Product.findById(item.productId); // Fetch product to get current stock and ownerId
        if (product && product.stock < 10) {
          const owner = await User.findById(product.storeOwnerId); // Use storeOwnerId from product
          if (owner?.email) {
            sendEmail(owner.email, 'Low Inventory Alert ⚠️', `Your product ${product.name} is low on stock (${product.stock} left).`).catch(e => console.error('Inventory alert failed'));
          }
        }
      }
      
      res.status(201).json(order);
    } catch (emailErr) {
      console.error('Order notification flow failed:', emailErr);
      // Even if email fails, the order is created, so we still send a success response
      res.status(201).json(order); 
    }
  } catch (err) {
    console.error('Order creation error:', err.message);
    res.status(500).json({ error: 'Order creation failed', details: err.message });
  }
});

// Get User's Orders
router.get('/orders', protect, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'FARMER') query.farmerId = req.user.id;
    else if (req.user.role === 'STORE_OWNER') query.storeOwnerId = req.user.id;

    const orders = await Order.find(query).populate('items.productId').sort('-createdAt');
    res.json(orders);
  } catch (err) {
    console.error('Fetch orders error:', err.message);
    res.status(500).json({ error: 'Failed to fetch orders', details: err.message });
  }
});

// Update Order Status (Store Owner / Admin)
router.patch('/orders/:id/status', protect, authorize('STORE_OWNER', 'ADMIN'), async (req, res) => {
  try {
    const { status } = req.body;
    const query = req.user.role === 'ADMIN' ? { _id: req.params.id } : { _id: req.params.id, storeOwnerId: req.user.id };
    
    const order = await Order.findOneAndUpdate(query, { status }, { new: true }).populate('farmerId');
    if (!order) return res.status(404).json({ error: 'Order not found' });

    // Notify Farmer about status update
    try {
      if (order.farmerId?.email) {
        await sendOrderStatusEmail(order.farmerId.email, {
          trackingId: order.trackingId,
          userName: order.farmerId.name,
          status: order.status
        });
      }
    } catch (emailErr) {
       console.error('Status update email failed:', emailErr.message);
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// Verify Product (ADMIN only)
router.patch('/verify/:id', protect, authorize('ADMIN'), async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, { isVerified: true }, { new: true });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: 'Verification failed' });
  }
});

export default router;
