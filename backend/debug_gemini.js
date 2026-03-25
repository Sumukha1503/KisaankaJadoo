import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

async function testGemini() {
  console.log('Testing Gemini API with key:', GEMINI_API_KEY ? 'FOUND' : 'MISSING');
  if (!GEMINI_API_KEY) return;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
    console.log('URL:', url);
    
    const response = await axios.post(url, {
      contents: [{
        parts: [{ text: "Hello, say 'Magic Farmer Ready'" }]
      }]
    });

    console.log('SUCCESS!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
  } catch (err) {
    console.error('FAILED!');
    if (err.response) {
      console.error('Status:', err.response.status);
      console.error('Data:', JSON.stringify(err.response.data, null, 2));
    } else {
      console.error('Message:', err.message);
    }
  }
}

testGemini();
