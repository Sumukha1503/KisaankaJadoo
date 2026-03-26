import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { sendWelcomeEmail, sendSecurityAlert, sendOTP, sendPasswordReset } from '../utils/emailService.js';

const router = Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, district, phone } = req.body;
    const sanitizedEmail = email?.trim().toLowerCase();
    
    const userExists = await User.findOne({ email: sanitizedEmail });
    if (userExists) return res.status(400).json({ error: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ 
      name, 
      email: sanitizedEmail, 
      password: hashedPassword, 
      role, 
      district, 
      phone 
    });
    await user.save();
    
    if (sanitizedEmail) {
      const mockOtp = Math.floor(100000 + Math.random() * 900000).toString();
      sendOTP(sanitizedEmail, mockOtp).catch(err => console.error('[AUTH] OTP email failed:', err.message));
      sendWelcomeEmail(sanitizedEmail, user.name).catch(err => console.error('[AUTH] Welcome email failed:', err.message));
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'secret123', { expiresIn: '24h' });
    res.status(201).json({ token, user: { id: user._id, name: user.name, role: user.role } });
  } catch (error) {
    console.error('Register Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email?.trim().toLowerCase() });
    
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const secret = process.env.JWT_SECRET || 'secret123';
    const token = jwt.sign({ id: user._id, role: user.role }, secret, { expiresIn: '24h' });
    
    if (user.email) {
      sendSecurityAlert(user.email, { 
        device: 'Chrome on Mac', 
        location: 'In-App session' 
      }).catch(e => console.error('Security alert failed:', e.message));
    }

    res.json({ token, user: { id: user._id, name: user.name, role: user.role } });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Forgot Password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email?.trim().toLowerCase() });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret123', { expiresIn: '1h' });
    const resetLink = `${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    
    await sendPasswordReset(user.email, resetLink);
    res.json({ message: 'Reset email sent' });
  } catch (err) {
    console.error('Forgot PW Error:', err);
    res.status(500).json({ error: 'Failed to send reset email' });
  }
});

// Reset Password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('Reset PW Error:', err);
    res.status(400).json({ error: 'Invalid or expired token' });
  }
});

export default router;