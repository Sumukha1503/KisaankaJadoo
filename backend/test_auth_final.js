import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import axios from 'axios';
dotenv.config();

const secret = process.env.JWT_SECRET || 'secret123';
const token = jwt.sign({ id: '65f123456789012345678901', role: 'farmer' }, secret, { expiresIn: '1h' });

async function test() {
  try {
    const res = await axios.post('http://localhost:5001/api/ai/assistant/chat', 
      { message: 'Hello', language: 'en-IN' },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log('SUCCESS:', res.data.reply);
  } catch (err) {
    console.error('FAILED:', err.response?.data || err.message);
  }
}

test();
