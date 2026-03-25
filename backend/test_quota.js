import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

async function testModels() {
  const models = [
    'gemini-1.5-flash',
    'gemini-1.5-flash-latest',
    'gemini-1.5-pro',
    'gemini-pro-vision', // old but might be there
    'gemini-2.0-flash-exp'
  ];

  for (const model of models) {
    console.log(`\n--- Testing ${model} ---`);
    try {
      // Try v1 first
      const url = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
      const response = await axios.post(url, {
        contents: [{ parts: [{ text: "Short hello" }] }]
      });
      console.log(`✅ ${model} (v1) SUCCESS`);
      break; 
    } catch (err) {
      console.log(`❌ ${model} (v1) FAILED: ${err.response?.status || err.message}`);
      if (err.response?.data?.error?.message) console.log(`Reason: ${err.response.data.error.message}`);
      
      // Try v1beta
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
        const response = await axios.post(url, {
          contents: [{ parts: [{ text: "Short hello" }] }]
        });
        console.log(`✅ ${model} (v1beta) SUCCESS`);
        break;
      } catch (err2) {
        console.log(`❌ ${model} (v1beta) FAILED: ${err2.response?.status || err2.message}`);
      }
    }
  }
}

testModels();
