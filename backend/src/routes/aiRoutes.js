import { Router } from 'express';
import axios from 'axios';
import { protect } from '../middleware/authMiddleware.js';
import DiseaseScan from '../models/DiseaseScan.js';
import User from '../models/User.js';
import { sendDiseaseDetectionEmail } from '../utils/emailService.js';

const router = Router();

const LANGUAGE_CONFIG = {
  'en-IN': {
    name: 'English',
    ttsCode: 'en-IN',
    speaker: 'shubh',
    fallbackPrefix: 'Here is the best next step for the farmer:'
  },
  'hi-IN': {
    name: 'Hindi',
    ttsCode: 'hi-IN',
    speaker: 'priya',
    fallbackPrefix: 'किसान के लिए सबसे अच्छा अगला कदम यह है:'
  },
  'kn-IN': {
    name: 'Kannada',
    ttsCode: 'kn-IN',
    speaker: 'ishita',
    fallbackPrefix: 'ರೈತನಿಗೆ ಈಗ ಸೂಕ್ತವಾದ ಮುಂದಿನ ಹೆಜ್ಜೆ ಇದು:'
  }
};

const APP_ACTIONS = [
  {
    route: '/scanner',
    label: 'Open disease scanner',
    keywords: ['disease', 'leaf', 'pest', 'crop problem', 'crop issue', 'plant issue', 'blight', 'fungus', 'infection', 'scan', 'scanner', 'photo', 'upload leaf', 'रोग', 'बीमारी', 'कीट', 'पत्ता', 'स्कैन', 'स्कैनर', 'फोटो', 'ಇಲೆ', 'ರೋಗ', 'ಕೀಟ', 'ಸ್ಕ್ಯಾನ್', 'ಸ್ಕ್ಯಾನರ್', 'ಫೋಟೋ']
  },
  {
    route: '/labour',
    label: 'Open labour marketplace',
    keywords: ['labour', 'worker', 'workers', 'harvest team', 'helper', 'helpers', 'staff', 'team for harvest', 'sowing team', 'spraying team', 'मजदूर', 'कामगार', 'कार्मिक', 'मदद के लिए आदमी', 'काम करने वाले', 'ಕಾರ್ಮಿಕ', 'ಕೆಲಸಗಾರ', 'ಕೆಲಸದವರು', 'ಸಹಾಯಕರು']
  },
  {
    route: '/welfare',
    label: 'Open welfare hub',
    keywords: ['scheme', 'schemes', 'subsidy', 'insurance', 'pm kisan', 'loan', 'government support', 'eligibility', 'benefit', 'योजना', 'योजनाएं', 'सब्सिडी', 'बीमा', 'लोन', 'सरकारी मदद', 'पात्रता', 'ಯೋಜನೆ', 'ಯೋಜನೆಗಳು', 'ಸಬ್ಸಿಡಿ', 'ವಿಮೆ', 'ಸಾಲ', 'ಸರಕಾರಿ ಸಹಾಯ']
  },
  {
    route: '/vehicles',
    label: 'Open vehicle rentals',
    keywords: ['tractor', 'vehicle', 'harvester', 'rent tractor', 'machine', 'machinery', 'rotavator', 'rent vehicle', 'ट्रैक्टर', 'वाहन', 'हार्वेस्टर', 'मशीन', 'भाड़े पर ट्रैक्टर', 'ಟ್ರಾಕ್ಟರ್', 'ವಾಹನ', 'ಹಾರ್ವೆಸ್ಟರ್', 'ಯಂತ್ರ', 'ಬಾಡಿಗೆ ಟ್ರಾಕ್ಟರ್']
  },
  {
    route: '/vendors',
    label: 'Open vendor marketplace',
    keywords: ['sell', 'vendor', 'market', 'buyer', 'buyers', 'price for crop', 'wholesale', 'trader', 'trading', 'बेचना', 'बाजार', 'विक्रेता', 'खरीदार', 'थोक', 'मंडी', 'ಮಾರಾಟ', 'ಮಾರುಕಟ್ಟೆ', 'ಖರೀದಿದಾರ', 'ಹೋಲ್‌ಸೇಲ್', 'ವ್ಯಾಪಾರಿ']
  },
  {
    route: '/shop',
    label: 'Open farm shop',
    keywords: ['buy', 'shop', 'seed', 'fertilizer', 'fertiliser', 'pesticide', 'spray', 'order seeds', 'order fertilizer', 'खरीद', 'बीज', 'उर्वरक', 'दवा', 'स्प्रे', 'ऑर्डर', 'ಖರೀದಿ', 'ಬೀಜ', 'ಗೊಬ್ಬರ', 'ಔಷಧಿ', 'ಸ್ಪ್ರೇ', 'ಆರ್ಡರ್']
  },
  {
    route: '/farm-wizard',
    label: 'Open farm planning',
    keywords: ['plan', 'yield', 'forecast', 'analysis', 'farm analysis', 'crop planning', 'what to grow', 'estimate yield', 'weather', 'rain', 'temperature', 'soil', 'crop', 'farm', 'सलाह', 'उपज', 'विश्लेषण', 'क्या उगाऊं', 'बारिश', 'मौसम', 'मिट्टी', 'फसल', 'खेती', 'फार्म प्लान', 'ಉತ್ಪಾದನೆ', 'ವಿಶ್ಲೇಷಣೆ', 'ಏನು ಬೆಳೆಸಲಿ', 'ಮಳೆ', 'ಹವಾಮಾನ', 'ಮಣ್ಣು', 'ಬೆಳೆ', 'ಕೃಷಿ', 'ಫಾರ್ಮ್ ಪ್ಲಾನ್']
  },
  {
    route: '/knowledge',
    label: 'Open knowledge hub',
    keywords: ['guide', 'training', 'knowledge', 'learn', 'tips', 'farming advice', 'best practice', 'how to', 'how do i', 'improve crop', 'जानकारी', 'सीख', 'गाइड', 'सलाह', 'मदद चाहिए', 'कैसे', 'कैसे करें', 'ಮಾಹಿತಿ', 'ಜ್ಞಾನ', 'ಕಲಿಕೆ', 'ಸಲಹೆ', 'ಹೇಗೆ', 'ಹೇಗೆ ಮಾಡು', 'ಉತ್ತಮ ವಿಧಾನ']
  }
];

function normalizeText(message = '') {
  return message
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function detectAction(message = '', history = []) {
  const query = normalizeText(message);
  const scoredActions = APP_ACTIONS.map((action) => {
    const score = action.keywords.reduce((total, keyword) => {
      const normalizedKeyword = normalizeText(keyword);
      return query.includes(normalizedKeyword) ? total + normalizedKeyword.split(' ').length : total;
    }, 0);

    return { action, score };
  }).sort((left, right) => right.score - left.score);

  if (scoredActions[0]?.score > 0) {
    return scoredActions[0].action;
  }

  const lastUserMessage = [...history].reverse().find((item) => item.role === 'user' && item.content !== message);
  if (lastUserMessage) {
    const inheritedAction = detectAction(lastUserMessage.content, []);
    if (inheritedAction) return inheritedAction;
  }

  if (/(help|assist|problem|issue|question|doubt|मदद|सवाल|समस्या|सहाय|ಪ್ರಶ್ನೆ|ಸಹಾಯ|ಸಮಸ್ಯೆ)/.test(query)) {
    if (/(crop|farm|soil|weather|rain|yield|फसल|खेती|मिट्टी|मौसम|उपज|ಬೆಳೆ|ಕೃಷಿ|ಮಣ್ಣು|ಹವಾಮಾನ|ಉತ್ಪಾದನೆ)/.test(query)) {
      return APP_ACTIONS.find((action) => action.route === '/farm-wizard') || null;
    }

    return APP_ACTIONS.find((action) => action.route === '/knowledge') || null;
  }

  return null;
}

function buildFallbackReply(message, language, action) {
  const config = LANGUAGE_CONFIG[language] || LANGUAGE_CONFIG['en-IN'];

  if (action?.route === '/scanner') {
    if (language === 'hi-IN') {
      return 'अगर पत्तियों पर धब्बे, पीला रंग, सूखना या कीट दिख रहे हैं, तो AI Scanner खोलकर फोटो अपलोड करें। स्कैन के बाद बीमारी और शुरुआती उपचार की सलाह मिल जाएगी।';
    }
    if (language === 'kn-IN') {
      return 'ಇಲೆಯ ಮೇಲೆ ಕಲೆಗಳು, ಹಳದಿ ಬಣ್ಣ, ಒಣಗುವುದು ಅಥವಾ ಕೀಟ ಹಾನಿ ಕಂಡರೆ AI Scanner ತೆರೆದು ಫೋಟೋ ಅಪ್ಲೋಡ್ ಮಾಡಿ. ಸ್ಕ್ಯಾನ್ ಆದ ನಂತರ ರೋಗ ಮತ್ತು ಆರಂಭಿಕ ಚಿಕಿತ್ಸೆ ಸಲಹೆ ಸಿಗುತ್ತದೆ.';
    }
    return 'If the crop shows spots, yellowing, drying, or pest damage, open the AI Scanner and upload a leaf photo. The app will suggest the likely disease and an early treatment step.';
  }

  if (action?.route === '/labour') {
    if (language === 'hi-IN') {
      return 'Labour Market में काम का प्रकार, तारीख और ज़रूरत लिखकर पोस्ट करें। इससे आसपास के उपलब्ध मजदूरों को जल्दी सूचना मिलेगी और आप मिलान देख पाएंगे।';
    }
    if (language === 'kn-IN') {
      return 'Labour Market ನಲ್ಲಿ ಕೆಲಸದ ಪ್ರಕಾರ, ದಿನಾಂಕ ಮತ್ತು ಅಗತ್ಯವನ್ನು ಪೋಸ್ಟ್ ಮಾಡಿ. ಹತ್ತಿರದ ಲಭ್ಯ ಕಾರ್ಮಿಕರಿಗೆ ತಕ್ಷಣ ಮಾಹಿತಿ ಹೋಗಿ ಹೊಂದುವವರನ್ನು ನೋಡಬಹುದು.';
    }
    return 'Post the task type, date, and requirement in Labour Market. Nearby workers can then be matched faster for harvesting, sowing, spraying, or transport work.';
  }

  if (action?.route === '/welfare') {
    if (language === 'hi-IN') {
      return 'Welfare Hub में PM-KISAN, बीमा, क्रेडिट और मिट्टी स्वास्थ्य जैसी योजनाएं देख सकते हैं. योजना चुनकर eligibility और आधिकारिक लिंक देखिए.';
    }
    if (language === 'kn-IN') {
      return 'Welfare Hub ನಲ್ಲಿ PM-KISAN, ವಿಮೆ, ಕ್ರೆಡಿಟ್ ಮತ್ತು ಮಣ್ಣು ಆರೋಗ್ಯ ಯೋಜನೆಗಳನ್ನು ನೋಡಬಹುದು. ಯೋಜನೆ ಆಯ್ಕೆ ಮಾಡಿ ಅರ್ಹತೆ ಮತ್ತು ಅಧಿಕೃತ ಲಿಂಕ್ ಪರಿಶೀಲಿಸಿ.';
    }
    return 'In Welfare Hub you can review PM-KISAN, insurance, credit, and soil-health schemes. Open the scheme card to check eligibility and the official link.';
  }

  if (action?.route === '/vehicles') {
    if (language === 'hi-IN') {
      return 'Vehicles सेक्शन में ट्रैक्टर, हार्वेस्टर या दूसरी मशीनरी किराये पर देख सकते हैं। अपनी जरूरत के हिसाब से वाहन चुनकर booking शुरू करें।';
    }
    if (language === 'kn-IN') {
      return 'Vehicles ವಿಭಾಗದಲ್ಲಿ ಟ್ರಾಕ್ಟರ್, ಹಾರ್ವೆಸ್ಟರ್ ಅಥವಾ ಬೇರೆ ಯಂತ್ರಗಳನ್ನು ಬಾಡಿಗೆಗೆ ನೋಡಬಹುದು. ನಿಮ್ಮ ಅಗತ್ಯಕ್ಕೆ ತಕ್ಕಂತೆ ವಾಹನವನ್ನು ಆಯ್ಕೆ ಮಾಡಿ booking ಪ್ರಾರಂಭಿಸಿ.';
    }
    return 'Open Vehicles to rent tractors, harvesters, or other machinery. Choose the machine you need and start the booking from there.';
  }

  if (action?.route === '/vendors') {
    if (language === 'hi-IN') {
      return 'Vendor Marketplace में अपनी उपज बेचने, खरीदार देखने और दाम समझने की शुरुआत करें। वहां से listing या offer flow खोल सकते हैं।';
    }
    if (language === 'kn-IN') {
      return 'Vendor Marketplace ನಲ್ಲಿ ನಿಮ್ಮ ಉತ್ಪನ್ನವನ್ನು ಮಾರಾಟ ಮಾಡಲು, ಖರೀದಿದಾರರನ್ನು ನೋಡಲು ಮತ್ತು ಬೆಲೆಯನ್ನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳಲು ಆರಂಭಿಸಬಹುದು. ಅಲ್ಲಿಂದ listing ಅಥವಾ offer flow ತೆರೆಯಬಹುದು.';
    }
    return 'Open Vendor Marketplace to sell produce, review buyers, and work with offers. You can continue by creating a listing or checking available buyers.';
  }

  if (action?.route === '/shop') {
    if (language === 'hi-IN') {
      return 'Farm Shop में बीज, खाद, स्प्रे और दूसरी जरूरी चीजें देख सकते हैं। वहां से प्रोडक्ट चुनकर सीधे cart में जोड़ें।';
    }
    if (language === 'kn-IN') {
      return 'Farm Shop ನಲ್ಲಿ ಬೀಜ, ಗೊಬ್ಬರ, ಸ್ಪ್ರೇ ಮತ್ತು ಬೇರೆ ಅಗತ್ಯ ವಸ್ತುಗಳನ್ನು ನೋಡಬಹುದು. ಅಲ್ಲಿ ಉತ್ಪನ್ನ ಆಯ್ಕೆ ಮಾಡಿ cart ಗೆ ಸೇರಿಸಿ.';
    }
    return 'Open Farm Shop to browse seeds, fertilizers, sprays, and other inputs. Pick the needed item and add it to the cart.';
  }

  if (action?.route === '/farm-wizard') {
    if (language === 'hi-IN') {
      return 'Farm Wizard में फसल, जमीन और लोकेशन की जानकारी देकर yield analysis और planning सलाह पा सकते हैं। अगला कदम वही खोलना है।';
    }
    if (language === 'kn-IN') {
      return 'Farm Wizard ನಲ್ಲಿ ಬೆಳೆ, ಜಮೀನು ಮತ್ತು ಸ್ಥಳದ ಮಾಹಿತಿ ನೀಡಿ yield analysis ಮತ್ತು planning ಸಲಹೆ ಪಡೆಯಬಹುದು. ಮುಂದಿನ ಹೆಜ್ಜೆ ಅದನ್ನು ತೆರೆಯುವುದಾಗಿದೆ.';
    }
    return 'Open Farm Wizard to enter crop, land, and location details for planning help and yield analysis.';
  }

  if (action?.route === '/knowledge') {
    if (language === 'hi-IN') {
      return 'Knowledge Hub में खेती से जुड़ी जानकारी, training links और trusted resources मिलेंगे। वहां से सीखने के लिए सही section खोलिए।';
    }
    if (language === 'kn-IN') {
      return 'Knowledge Hub ನಲ್ಲಿ ಕೃಷಿ ಮಾಹಿತಿ, training links ಮತ್ತು trusted resources ಸಿಗುತ್ತವೆ. ಕಲಿಯಲು ಸರಿಯಾದ ವಿಭಾಗವನ್ನು ಅಲ್ಲಿ ತೆರೆಯಿರಿ.';
    }
    return 'Open Knowledge Hub for farming guidance, training links, and trusted learning resources.';
  }

  if (language === 'hi-IN') {
    return `${config.fallbackPrefix} अपने सवाल को थोड़ा और स्पष्ट लिखें, जैसे फसल का नाम, समस्या, गांव या आपको किस सुविधा की ज़रूरत है. मैं उसी आधार पर सही मॉड्यूल सुझाऊंगा।`;
  }
  if (language === 'kn-IN') {
    return `${config.fallbackPrefix} ನಿಮ್ಮ ಪ್ರಶ್ನೆಯನ್ನು ಸ್ವಲ್ಪ ವಿವರವಾಗಿ ಬರೆಯಿರಿ, ಉದಾಹರಣೆಗೆ ಬೆಳೆ ಹೆಸರು, ಸಮಸ್ಯೆ, ಊರು ಅಥವಾ ಬೇಕಾದ ಸೇವೆ. ಅದನ್ನು ಆಧರಿಸಿ ಸರಿಯಾದ ಮಾಡ್ಯೂಲ್ ಸೂಚಿಸುತ್ತೇನೆ.`;
  }
  return `${config.fallbackPrefix} share a little more detail like the crop, problem, village, or service you need, and I will guide you to the right tool in the app.`;
}

function getSupportedRoutes() {
  return APP_ACTIONS.map((action) => action.route);
}

function coerceActionFromRoute(route) {
  if (!route) return null;
  return APP_ACTIONS.find((action) => action.route === route) || null;
}

function extractTextFromGeminiResponse(data) {
  return data?.candidates?.[0]?.content?.parts
    ?.map((part) => part.text || '')
    .join('')
    .trim();
}

async function getGeminiAssistantReply(message, language, role, history, currentParams = {}, actionHint = null) {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  const config = LANGUAGE_CONFIG[language] || LANGUAGE_CONFIG['en-IN'];
  const conversation = history
    .slice(-8)
    .map((item) => `${item.role === 'assistant' ? 'Assistant' : 'User'}: ${item.content}`)
    .join('\n');

  const roleContext = `User Role: ${role || 'FARMER'}.
  - FARMER: Can perform all actions.
  - LABOUR: Can ONLY manage their profile. If they try to book labour or rent vehicles, tell them they are a labourer.
  - VEHICLE_OWNER: Can ONLY manage their vehicles.
  - VENDOR: Can ONLY manage market offers and bids.
  - STORE_OWNER: Can ONLY manage shop products.`;

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${GEMINI_API_KEY}`,
      {
        generationConfig: { temperature: 0.3, responseMimeType: 'application/json' },
        contents: [{
          role: 'user',
          parts: [{
            text: `You are a router and parameter extractor for KisaanKaJadoo.\nRespond ONLY in ${config.name}.\n${roleContext}\n- If the user has a transactional intent (labour, vehicle, vendor) AND their role allows it, extract fields into "params" using this history: ${JSON.stringify(currentParams)}.\n- IMPORTANT: ALWAYS return dates in YYYY-MM-DD format.\n- If any mandatory fields are missing for allowed routes, set "route" to null and ask for them in "reply".\n- If the user's role DOES NOT allow the requested transaction, set "route" to null and explain in "reply" based on their role.\n- If general agricultural question, respond in "reply" and set "route" and "params" to null.\n\n### MANDATORY FIELDS:\n- /labour: "taskType", "date", "workersNeeded", "budget", "district".\n- /vehicles: "type", "hours", "budget".\n- /vendors: "cropName", "quantity", "pricePerKg".\n\nReturn strict JSON ONLY: {"reply":"string|null","route":"string|null","params":object|null}.\n\nRecent conversation:\n${conversation}\n\nLatest message:\n${message}`
          }]
        }]
      },
      { headers: { 'Content-Type': 'application/json' }, timeout: 8000 }
    );

    const rawText = extractTextFromGeminiResponse(response.data);
    if (!rawText) return { reply: "I couldn't generate a response. Please try again.", action: null, params: null };

    try {
      const parsed = JSON.parse(rawText.replace(/```json|```/g, '').trim());
      return {
        reply: typeof parsed.reply === 'string' ? parsed.reply.trim() : '',
        action: coerceActionFromRoute(parsed.route),
        params: parsed.params || null
      };
    } catch (error) {
      console.error('[AI] JSON Parse failed:', rawText);
      return { reply: rawText, action: null, params: null };
    }
  } catch (apiErr) {
    const status = apiErr.response?.status;
    console.error(`[AI] Gemini API Error (${status}):`, apiErr.response?.data?.error?.message || apiErr.message);
    
    if (status === 429) {
      return { reply: "Gemini Quota Exceeded. Please try again in a minute or use a different API key.", action: null, params: null };
    }
    return { reply: "I'm having trouble connecting to Gemini. Please check your API key and connection.", action: null, params: null };
  }
}

async function getSarvamChatReply(message, language, history, action) {
  const SARVAM_API_KEY = process.env.SARVAM_API_KEY;
  if (!SARVAM_API_KEY) return null;
  const config = LANGUAGE_CONFIG[language] || LANGUAGE_CONFIG['en-IN'];
  const appHint = action ? `If useful, recommend ${action.route}.` : 'Guide them to the best module.';
  const response = await axios.post('https://api.sarvam.ai/v1/chat/completions', {
    model: 'sarvam-m',
    temperature: 0.3,
    messages: [
      { role: 'system', content: `You are KisaanKaJadoo's assistant. Reply in ${config.name}. ${appHint}` },
      ...history.filter(h => h.role === 'user' || h.role === 'assistant').map(h => ({ role: h.role === 'user' ? 'user' : 'assistant', content: h.content })),
      { role: 'user', content: message }
    ]
  }, { headers: { 'api-subscription-key': SARVAM_API_KEY, 'Content-Type': 'application/json' } });
  return response.data?.choices?.[0]?.message?.content?.trim();
}

router.post('/scan', protect, async (req, res) => {
  try {
    const { imageUrl, prediction, confidence, remedy } = req.body;
    const scan = new DiseaseScan({ farmerId: req.user.id, imageUrl, prediction, confidence, remedy });
    await scan.save();
    res.status(201).json(scan);
  } catch (err) { res.status(500).json({ error: 'Failed to save scan' }); }
});

router.post('/analyze-disease', protect, async (req, res) => {
  try {
    const { imageBase64, language = 'en-IN' } = req.body;
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!imageBase64) return res.status(400).json({ error: 'Image data required' });
    let cleanBase64 = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;
    const response = await axios.post(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${GEMINI_API_KEY}`, {
      generationConfig: { temperature: 0.2, responseMimeType: 'application/json' },
      contents: [{ role: 'user', parts: [{ inlineData: { mimeType: 'image/jpeg', data: cleanBase64 } }, { text: 'Analyze crop disease. Return JSON: {"disease": "...", "confidence": 0-100, "treatment": "...", "severity": "mild|moderate|severe"}' }] }]
    }, { headers: { 'Content-Type': 'application/json' } });
    const rawText = extractTextFromGeminiResponse(response.data);
    const result = JSON.parse(rawText);
    const scan = new DiseaseScan({ farmerId: req.user.id, imageUrl: '...', prediction: result.disease, confidence: result.confidence, remedy: result.treatment, severity: result.severity });
    await scan.save();

    // Send health alert email
    const user = await User.findById(req.user.id);
    if (user?.email) {
      sendDiseaseDetectionEmail(user.email, {
        disease: result.disease,
        confidence: result.confidence,
        treatment: result.treatment,
        precautions: [
          'Isolate affected plants if possible',
          'Avoid overhead watering to reduce spread',
          'Sanitize tools after use in the affected area',
          'Open the app in 3 days for a follow-up check'
        ]
      }).catch(err => console.error('Disease email failed:', err.message));
    }

    res.json(result);
  } catch (apiErr) {
    const status = apiErr.response?.status;
    const errorMsg = apiErr.response?.data?.error?.message || apiErr.message;
    console.error(`[AI] Gemini API Error (${status}):`, errorMsg);
    
    let friendlyReply = "I'm having trouble connecting to my AI brain right now. Please check if your API key is valid and has enough quota.";
    if (status === 429) friendlyReply = "AI Quota Exceeded. Please wait a minute or provide a fresh Gemini API key in the .env file.";
    else if (status === 403) friendlyReply = "AI API Key is invalid or restricted. Please check your .env settings.";
    else if (status === 404) friendlyReply = "AI Model not found. I'm trying to use gemini-2.0-flash.";

    // For /analyze-disease, we return a JSON object with disease, confidence, treatment, severity.
    // We need to map the error to this structure.
    res.json({ 
      disease: "Analysis Failed", 
      confidence: 0, 
      treatment: friendlyReply, 
      severity: "severe",
      error: errorMsg 
    });
  }
});

router.get('/history', protect, async (req, res) => {
  try { res.json(await DiseaseScan.find({ farmerId: req.user.id }).sort('-createdAt')); }
  catch (err) { res.status(500).json({ error: 'History failed' }); }
});

router.post('/assistant/chat', protect, async (req, res) => {
  try {
    const { message = '', language = 'en-IN', role = 'FARMER', history = [], currentParams = {} } = req.body;
    if (!message.trim()) return res.status(400).json({ error: 'Message required' });
    let action = detectAction(message, history);
    let reply = null;
    let params = null;
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    const SARVAM_API_KEY = process.env.SARVAM_API_KEY;
    if (GEMINI_API_KEY) {
      const geminiResult = await getGeminiAssistantReply(message, language, role, history, currentParams, action);
      if (geminiResult) {
        reply = geminiResult.reply;
        action = geminiResult.action || action;
        params = geminiResult.params;
      }
    }
    if (SARVAM_API_KEY && !reply) reply = await getSarvamChatReply(message, language, history, action);
    if (!reply) reply = buildFallbackReply(message, language, action);
    res.json({ reply, action, params });
  } catch (err) { res.status(500).json({ error: 'Chat failed' }); }
});

router.post('/assistant/speak', protect, async (req, res) => {
  try {
    const { text = '', language = 'en-IN' } = req.body;
    const config = LANGUAGE_CONFIG[language] || LANGUAGE_CONFIG['en-IN'];
    const SARVAM_API_KEY = process.env.SARVAM_API_KEY;
    if (!SARVAM_API_KEY) return res.json({ provider: 'fallback', text });
    const response = await axios.post('https://api.sarvam.ai/text-to-speech', { text: text.slice(0, 500), target_language_code: config.ttsCode, speaker: config.speaker, model: 'bulbul:v3' }, { headers: { 'api-subscription-key': SARVAM_API_KEY, 'Content-Type': 'application/json' } });
    res.json({ provider: 'sarvam', audioBase64: response.data?.audios?.[0] || null, mimeType: 'audio/wav' });
  } catch (err) { res.json({ provider: 'fallback', text: req.body.text }); }
});

export default router;
