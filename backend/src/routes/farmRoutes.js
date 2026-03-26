import { Router } from 'express';
import axios from 'axios';
import { protect } from '../middleware/authMiddleware.js';

import FarmAnalysis from '../models/FarmAnalysis.js';
import User from '../models/User.js';
import { sendFarmAnalysisEmail } from '../utils/emailService.js';

const router = Router();

// Helper to extract text from Gemini response (mirrored from aiRoutes for now)
function extractText(data) {
  return data?.candidates?.[0]?.content?.parts?.map(p => p.text || '').join('').trim();
}

router.post('/analyze', protect, async (req, res) => {
  try {
    const { crop, acreage, soil, city } = req.body;
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    if (!GEMINI_API_KEY) {
      return res.status(500).json({ error: 'Gemini API not configured' });
    }

    // 1. Fetch Weather (Mocked/Real)
    let temp = 28;
    let condition = 'Clear Skies';
    if (process.env.OPENWEATHER_API_KEY) {
      try {
        const weatherRes = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${process.env.OPENWEATHER_API_KEY}`);
        temp = weatherRes.data.main.temp;
        condition = weatherRes.data.weather[0].description;
      } catch (e) { console.warn('Weather fetch failed'); }
    }

    // 2. Call Gemini for Expert Analysis
    const prompt = `You are an expert agricultural advisor. Provide analysis for:
    Crop: ${crop}
    Acreage: ${acreage}
    Soil: ${soil}
    Location: ${city}
    Weather: ${temp}°C, ${condition}

    Return strict JSON ONLY:
    {
      "estimatedYield": number (in kg),
      "marketValue": number (in INR total),
      "recommendations": ["4-5 specific action steps"]
    }`;

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.2, responseMimeType: 'application/json' }
      }
    );

    const rawText = extractText(response.data);
    const result = JSON.parse(rawText);

    // 3. Save Analysis
    const analysis = new FarmAnalysis({
      farmerId: req.user.id,
      crop,
      acreage,
      soilType: soil,
      city,
      weather: { temp, condition },
      estimatedYield: result.estimatedYield,
      marketValue: result.marketValue,
      recommendations: result.recommendations
    });
    await analysis.save();
    
    // Send Analysis Email to Farmer
    try {
      const user = await User.findById(req.user.id);
      if (user?.email) {
        console.log(`[FARM] Sending analysis email to: ${user.email}`);
        await sendFarmAnalysisEmail(user.email, {
          crop,
          city,
          estimatedYield: result.estimatedYield,
          marketValue: result.marketValue,
          weather: { temp, condition },
          recommendations: result.recommendations
        });
      }
    } catch (emailErr) {
      console.error('[FARM] Email notification failed:', emailErr.message);
    }

    res.json({
      ...result,
      weather: { temp, description: condition },
      timestamp: new Date()
    });
  } catch (err) {
    console.error('Farm Wizard Error:', err.message);
    res.status(500).json({ error: 'Failed to analyze farm' });
  }
});

export default router;