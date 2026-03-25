import { Router } from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';

const router = Router();

// Get My Products (STORE_OWNER or ADMIN)
router.get('/products/my', protect, authorize('STORE_OWNER', 'ADMIN'), async (req, res) => {
  try {
    const products = await Product.find({ storeOwnerId: req.user.id });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch my products' });
  }
});

// Get all products (Public or Farmer)
router.get('/products', async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = {};
    if (category) query.category = category;
    if (search) query.name = { $regex: search, $options: 'i' };

    const products = await Product.find(query).sort('-createdAt');
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch products' });
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
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// Create Order (Farmer checkout)
router.post('/orders', protect, authorize('FARMER'), async (req, res) => {
  try {
    const { items, totalAmount, paymentMethod, shippingAddress, storeOwnerId } = req.body;
    
    // In production, we'd verify totalAmount matches actual product prices from DB
    // and deduct stock. For MVP, we skip complex stock deduction in transaction.
    
    const order = new Order({
      farmerId: req.user.id,
      storeOwnerId,
      items,
      totalAmount,
      paymentMethod,
      shippingAddress
    });
    
    await order.save();
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ error: 'Order creation failed' });
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
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

export default router;
