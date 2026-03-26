import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const SARVAM_API_KEY = process.env.SARVAM_API_KEY;

async function testSarvam() {
  console.log('Testing Sarvam TTS with key:', SARVAM_API_KEY ? 'FOUND' : 'MISSING');
  if (!SARVAM_API_KEY) return;

  try {
    const response = await axios.post('https://api.sarvam.ai/text-to-speech', {
      text: "Namaste, how are you today?",
      target_language_code: "en-IN",
      speaker: "shubh",
      model: "bulbul:v3"
    }, {
      headers: {
        'api-subscription-key': SARVAM_API_KEY,
        'Content-Type': 'application/json'
      }
    });

    if (response.data?.audios?.[0]) {
      console.log('✅ SUCCESS! Received audio data.');
    } else {
      console.log('❌ FAILED! No audio in response.');
      console.log('Response:', response.data);
    }
  } catch (err) {
    console.error('❌ FAILED!');
    if (err.response) {
      console.error('Status:', err.response.status);
      console.error('Data:', JSON.stringify(err.response.data, null, 2));
    } else {
      console.error('Message:', err.message);
    }
  }
}

testSarvam();
