import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = Router();

// Mock OTP and Register/Login
router.post('/register', async (req, res) => {
  try {
    const { name, phone, email, password, role } = req.body;
    
    // Sanitize unique fields: treat empty strings as undefined for sparse index
    const sanitizedPhone = phone?.trim() || undefined;
    const sanitizedEmail = email?.trim() || undefined;

    const query = [];
    if (sanitizedPhone) query.push({ phone: sanitizedPhone });
    if (sanitizedEmail) query.push({ email: sanitizedEmail });

    if (query.length > 0) {
      const userExists = await User.findOne({ $or: query });
      if (userExists) {
        return res.status(400).json({ error: 'User with this email or phone already exists' });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ 
      name: name?.trim(), 
      phone: sanitizedPhone, 
      email: sanitizedEmail, 
      password: hashedPassword, 
      role 
    });
    
    await user.save();

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'secret123', { expiresIn: '24h' });
    res.status(201).json({ token, user: { id: user._id, name: user.name, role: user.role } });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'User with this email or phone already exists' });
    }
    console.error('Register Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, phone, password } = req.body;
    console.log('Login attempt:', { email, phone, hasPassword: !!password });
    
    const identifier = email || phone;
    if (!identifier) return res.status(400).json({ error: 'Email or phone required' });

    const user = await User.findOne({ 
      $or: [{ email: identifier }, { phone: identifier }] 
    });
    
    if (!user) {
      console.log('User not found for identifier:', identifier);
      return res.status(400).json({ error: 'Account not found. Please register.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('Password mismatch for user:', identifier);
      return res.status(400).json({ error: 'Incorrect password. Try again.' });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'secret123', { expiresIn: '24h' });
    res.json({ token, user: { id: user._id, name: user.name, role: user.role } });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;