import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const SARVAM_API_KEY = process.env.SARVAM_API_KEY;

async function runHealthCheck() {
  console.log('--- SYSTEM HEALTH CHECK ---');
  
  // 1. Check Gemini
  console.log('\n[GEMINI] Testing with key:', GEMINI_API_KEY?.substring(0, 5) + '...');
  try {
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${GEMINI_API_KEY}`;
    const res = await axios.post(geminiUrl, {
      contents: [{ parts: [{ text: "Hi" }] }]
    });
    console.log('✅ GEMINI OK:', res.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim());
  } catch (err) {
    console.error('❌ GEMINI FAILED:', err.response?.status, JSON.stringify(err.response?.data?.error, null, 2) || err.message);
  }

  // 2. Check Sarvam
  console.log('\n[SARVAM] Testing with key:', SARVAM_API_KEY?.substring(0, 5) + '...');
  try {
    const res = await axios.post('https://api.sarvam.ai/text-to-speech', {
      text: "Test",
      target_language_code: "en-IN",
      speaker: "shubh",
      model: "bulbul:v3"
    }, {
      headers: { 'api-subscription-key': SARVAM_API_KEY, 'Content-Type': 'application/json' }
    });
    console.log('✅ SARVAM OK: Received', res.data?.audios?.length, 'audio(s)');
  } catch (err) {
    console.error('❌ SARVAM FAILED:', err.response?.status, err.message);
  }
}

runHealthCheck();
