import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

async function listModels() {
  console.log('Listing models for key:', GEMINI_API_KEY?.substring(0, 5) + '...');
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`;
    const res = await axios.get(url);
    console.log('--- AVAILABLE MODELS ---');
    res.data.models.forEach(m => {
      if (m.supportedGenerationMethods.includes('generateContent')) {
        console.log(`- ${m.name}`);
      }
    });
  } catch (err) {
    console.error('❌ FAILED TO LIST MODELS:', err.response?.status, err.response?.data?.error?.message || err.message);
  }
}

listModels();
