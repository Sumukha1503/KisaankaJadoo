import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

async function listModels() {
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`;
    const response = await axios.get(url);
    console.log('Available Models:');
    response.data.models.forEach(m => console.log(`- ${m.name}`));
  } catch (err) {
    console.error('FAILED to list models!');
    if (err.response) console.error(err.response.data);
    else console.error(err.message);
  }
}

listModels();
