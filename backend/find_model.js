import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

async function findWorkingModel() {
  const modelsToTry = [
    'gemini-flash-latest',
    'gemini-2.0-flash',
    'gemini-pro-latest',
    'gemini-1.5-flash-8b',
    'gemini-2.0-flash-lite-preview-09-2025'
  ];

  for (const model of modelsToTry) {
    console.log(`\n--- Testing ${model} ---`);
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
      const response = await axios.post(url, {
        contents: [{ parts: [{ text: "Hello" }] }]
      });
      console.log(`✅ ${model} SUCCESS! Status: ${response.status}`);
      return model;
    } catch (err) {
      console.log(`❌ ${model} FAILED: ${err.response?.status || err.message}`);
      if (err.response?.data?.error) {
         console.log('Error Details:', JSON.stringify(err.response.data.error, null, 2));
      }
    }
  }
}

findWorkingModel();
