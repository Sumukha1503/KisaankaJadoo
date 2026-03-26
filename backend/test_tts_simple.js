import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const SARVAM_API_KEY = process.env.SARVAM_API_KEY;

async function test() {
  try {
    const response = await axios.post(
      'https://api.sarvam.ai/text-to-speech',
      {
        text: 'Hello, this is a test.',
        target_language_code: 'en-IN',
        speaker: 'shubh',
        model: 'bulbul:v3'
      },
      {
        headers: {
          'api-subscription-key': SARVAM_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log('TTS Success, audio length:', response.data?.audios?.[0]?.length || 0);
  } catch (err) {
    console.error('TTS Failed:', err.response?.data || err.message);
  }
}

test();
