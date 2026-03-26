import { Router } from 'express';
import axios from 'axios';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/alerts', protect, async (req, res) => {
  try {
    const city = req.query.city || 'Hubli'; // Default for demo
    let temp = 32;
    let condition = 'clear sky';
    let humidity = 45;

    // Use OpenWeather if key exists, else mock
    if (process.env.OPENWEATHER_API_KEY) {
      try {
        const weatherRes = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${process.env.OPENWEATHER_API_KEY}`);
        temp = weatherRes.data.main.temp;
        condition = weatherRes.data.weather[0].description;
        humidity = weatherRes.data.main.humidity;
      } catch (e) { 
        console.error('Weather API ERROR:', e.response?.data || e.message);
        console.warn('Weather API failed, using improved mock'); 
        // Improved mock based on city hash
        const hash = city.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        temp = 25 + (hash % 15);
        humidity = 40 + (hash % 30);
        const conditions = ['clear sky', 'scattered clouds', 'light rain', 'moderate rain', 'haze'];
        condition = conditions[hash % conditions.length];
      }
    } else {
      // Improved mock even without key
      const hash = city.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      temp = 25 + (hash % 15);
      humidity = 40 + (hash % 30);
      const conditions = ['clear sky', 'scattered clouds', 'light rain', 'moderate rain', 'haze'];
      condition = conditions[hash % conditions.length];
    }

    // Smart advice logic
    let alert = {
      level: 'info',
      message: 'Weather looks good for general farming today.',
      icon: 'sun'
    };

    if (condition.includes('rain') || condition.includes('drizzle')) {
      alert = {
        level: 'warning',
        message: 'Sudden rain expected. Cover your harvested crops and check drainage.',
        icon: 'cloud-rain'
      };
    } else if (temp > 35) {
      alert = {
        level: 'caution',
        message: 'High heat alert! Increase irrigation frequency to prevent crop wilting.',
        icon: 'thermometer'
      };
    } else if (humidity > 80) {
      alert = {
        level: 'warning',
        message: 'High humidity detected. Monitor for fungal infections or pests.',
        icon: 'wind'
      };
    }

    res.json({
      city,
      temp,
      condition,
      humidity,
      alert
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch weather alerts' });
  }
});

export default router;
