import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

async function check() {
  console.log('--- GEMINI KEY DIAGNOSTIC ---');
  console.log('Key from .env:', GEMINI_API_KEY?.substring(0, 10) + '...' + GEMINI_API_KEY?.substring(GEMINI_API_KEY.length - 5));
  
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
    const res = await axios.post(url, { contents: [{ parts: [{ text: "hi" }] }] });
    console.log('✅ Status: WORKING');
  } catch (err) {
    console.log('❌ Status: FAILED');
    console.log('Error Code:', err.response?.status);
    console.log('Error Message:', err.response?.data?.error?.message);
  }
}

check();
