import { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Bot, Languages, MessageSquare, Mic, Send, Sparkles, Tractor, Volume2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import Layout from '../components/Layout';
import { useVoice } from '../hooks/useVoice';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const LANGUAGE_OPTIONS = [
  { id: 'en-IN', label: 'English', hint: 'Talk and hear the assistant in English.' },
  { id: 'hi-IN', label: 'हिन्दी', hint: 'खेती से जुड़े सवाल हिंदी में पूछें।' },
  { id: 'kn-IN', label: 'ಕನ್ನಡ', hint: 'ಕೃಷಿ ಸಹಾಯವನ್ನು ಕನ್ನಡದಲ್ಲಿ ಪಡೆಯಿರಿ.' }
];

const QUICK_ACTIONS = {
  'en-IN': [
    'Check a crop disease',
    'Help me find labour',
    'Show government schemes',
    'Guide me to farm planning'
  ],
  'hi-IN': [
    'फसल की बीमारी पहचानने में मदद करें',
    'मजदूर ढूंढने में मदद करें',
    'सरकारी योजनाएं बताइए',
    'फार्म प्लानिंग में मार्गदर्शन करें'
  ],
  'kn-IN': [
    'ಬೆಳೆ ರೋಗವನ್ನು ಗುರುತಿಸಲು ಸಹಾಯ ಮಾಡಿ',
    'ಕಾರ್ಮಿಕರನ್ನು ಹುಡುಕಲು ಸಹಾಯ ಮಾಡಿ',
    'ಸರಕಾರಿ ಯೋಜನೆಗಳನ್ನು ತಿಳಿಸಿ',
    'ಫಾರ್ಮ್ ಪ್ಲ್ಯಾನಿಂಗ್‌ಗೆ ಮಾರ್ಗದರ್ಶನ ನೀಡಿ'
  ]
};

const GREETING = {
  'en-IN': 'Namaste. I am your KisaanKaJadoo voice assistant. Ask me about crops, labour, schemes, vehicles, or market help.',
  'hi-IN': 'नमस्ते। मैं आपका KisaanKaJadoo सहायक हूं। फसल, मजदूर, योजनाएं, वाहन या बाजार से जुड़ा कोई भी सवाल पूछिए।',
  'kn-IN': 'ನಮಸ್ಕಾರ. ನಾನು ನಿಮ್ಮ KisaanKaJadoo ಸಹಾಯಕ. ಬೆಳೆ, ಕಾರ್ಮಿಕರು, ಯೋಜನೆಗಳು, ವಾಹನಗಳು ಅಥವಾ ಮಾರುಕಟ್ಟೆ ಬಗ್ಗೆ ಏನಾದರೂ ಕೇಳಿ.'
};

function getSpeechVoice(language) {
  if (!window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  return (
    voices.find((voice) => voice.lang === language) ||
    voices.find((voice) => voice.lang?.startsWith(language.slice(0, 2))) ||
    voices[0] ||
    null
  );
}

export default function AssistantPage() {
  const { token } = useSelector((state) => state.auth);
  const [language, setLanguage] = useState('en-IN');
  const [messages, setMessages] = useState([{ role: 'assistant', content: GREETING['en-IN'] }]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const navigate = useNavigate();
  const { isListening, startListening } = useVoice();
  const location = useLocation();
  const messagesEndRef = useRef(null);

  // Auto-start mic if redirected from top header
  useEffect(() => {
    if (location.state?.autoMic) {
      startVoiceInput();
      // Clear state so it doesn't re-trigger on fresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const quickActions = useMemo(() => QUICK_ACTIONS[language], [language]);

  useEffect(() => {
    setMessages([{ role: 'assistant', content: GREETING[language] }]);
    setInput('');
  }, [language]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!window.speechSynthesis) return undefined;

    const handleVoicesChanged = () => window.speechSynthesis.getVoices();
    window.speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);

    return () => window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
  }, []);

  const speakFallback = (text) => {
    if (!window.speechSynthesis || !text) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;
    utterance.voice = getSpeechVoice(language);
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const speakText = async (text) => {
    if (!text) return;

    try {
      setIsSpeaking(true);
      const { data } = await axios.post(
        `${API}/api/ai/assistant/speak`,
        { text, language },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.audioBase64) {
        const audio = new Audio(`data:${data.mimeType || 'audio/wav'};base64,${data.audioBase64}`);
        audio.onended = () => setIsSpeaking(false);
        audio.onerror = () => {
          setIsSpeaking(false);
          speakFallback(text);
        };
        await audio.play();
        return;
      }

      setIsSpeaking(false);
      speakFallback(data.text || text);
    } catch (error) {
      setIsSpeaking(false);
      speakFallback(text);
    }
  };

  const submitMessage = async (messageText) => {
    const cleanMessage = messageText.trim();
    if (!cleanMessage || isLoading) return;

    const nextMessages = [...messages, { role: 'user', content: cleanMessage }];
    setMessages(nextMessages);
    setInput('');
    setIsLoading(true);

    try {
      const { data } = await axios.post(
        `${API}/api/ai/assistant/chat`,
        {
          message: cleanMessage,
          language,
          history: nextMessages.slice(-8)
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessages((current) => [...current, { role: 'assistant', content: data.reply }]);
      speakText(data.reply);

      if (data.action?.route) {
        toast.success(data.action.label || 'Opening the suggested tool');
        setTimeout(() => navigate(data.action.route), 1200);
      }
    } catch (error) {
      const reply =
        language === 'hi-IN'
          ? 'अभी सहायक से जवाब नहीं मिल पाया। थोड़ी देर में फिर से कोशिश करें।'
          : language === 'kn-IN'
            ? 'ಸಹಾಯಕನಿಂದ ಉತ್ತರ ಬರಲಿಲ್ಲ. ಸ್ವಲ್ಪ ಸಮಯದ ನಂತರ ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.'
            : 'The assistant could not respond right now. Please try again in a moment.';
      setMessages((current) => [...current, { role: 'assistant', content: reply }]);
    } finally {
      setIsLoading(false);
    }
  };

  const startVoiceInput = () => {
    startListening({
      language,
      onResult: (text) => {
        setInput(text);
        submitMessage(text);
      }
    });
  };

  return (
    <Layout
      title="Farmer Voice Assistant"
      subtitle="Speak or chat in English, Hindi, or Kannada and get guided help across the platform."
    >
      <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <section className="space-y-6">
          <div className="rounded-[32px] border border-emerald-200 bg-gradient-to-br from-emerald-600 via-green-600 to-lime-500 p-6 text-white shadow-xl shadow-emerald-500/20">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20">
              <Bot size={24} />
            </div>
            <h2 className="text-2xl font-black leading-tight">Sarvam AI Farmer Assistant</h2>
            <p className="mt-3 text-sm text-emerald-50">
              Farmers can talk naturally, hear spoken responses, and jump to the right farm tool without hunting through menus.
            </p>

            <div className="mt-6 space-y-3">
              {LANGUAGE_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setLanguage(option.id)}
                  className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                    language === option.id
                      ? 'border-white bg-white text-emerald-700 shadow-lg'
                      : 'border-white/25 bg-white/10 text-white hover:bg-white/15'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-black">{option.label}</span>
                    <Languages size={16} />
                  </div>
                  <p className={`mt-1 text-xs ${language === option.id ? 'text-emerald-700/80' : 'text-emerald-50'}`}>
                    {option.hint}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-[32px] border border-gray-200 bg-white p-6 shadow-clay-card">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-amber-100 p-3 text-amber-600">
                <Tractor size={20} />
              </div>
              <div>
                <h3 className="text-lg font-black text-gray-900">Quick help for farmers</h3>
                <p className="text-sm text-gray-500">Tap a common request to start faster.</p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {quickActions.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => submitMessage(prompt)}
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-left text-sm font-semibold text-gray-700 transition hover:border-green-300 hover:bg-green-50 hover:text-green-700"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="flex min-h-[70vh] flex-col overflow-hidden rounded-[36px] border border-gray-200 bg-white shadow-clay-card">
          <div className="border-b border-gray-100 bg-gradient-to-r from-sky-50 via-white to-emerald-50 px-6 py-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-black text-gray-900">Voice + Chat Support</h2>
                <p className="text-sm text-gray-500">
                  Ask doubts, get guided answers, and hear them back in your language.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={startVoiceInput}
                  className={`inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold transition ${
                    isListening
                      ? 'bg-red-100 text-red-600'
                      : 'bg-gray-900 text-white hover:bg-gray-800'
                  }`}
                >
                  <Mic size={16} /> {isListening ? 'Listening...' : 'Speak'}
                </button>
                <button
                  type="button"
                  onClick={() => speakText(messages[messages.length - 1]?.content)}
                  disabled={isSpeaking || !messages.length}
                  className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 px-4 py-3 text-sm font-bold text-gray-700 transition hover:border-green-300 hover:text-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Volume2 size={16} /> {isSpeaking ? 'Speaking...' : 'Play answer'}
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto bg-[#f7faf8] px-4 py-5 md:px-6">
            {messages.map((message, index) => (
              <motion.div
                key={`${message.role}-${index}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className={`max-w-3xl rounded-[28px] px-5 py-4 shadow-sm ${
                  message.role === 'assistant'
                    ? 'mr-auto border border-emerald-100 bg-white text-gray-800'
                    : 'ml-auto bg-gray-900 text-white'
                }`}
              >
                <div className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] opacity-70">
                  {message.role === 'assistant' ? <Sparkles size={14} /> : <MessageSquare size={14} />}
                  {message.role === 'assistant' ? 'Assistant' : 'You'}
                </div>
                <p className="whitespace-pre-wrap text-sm leading-6">{message.content}</p>
              </motion.div>
            ))}

            {isLoading && (
              <div className="max-w-sm rounded-[28px] border border-emerald-100 bg-white px-5 py-4 text-sm text-gray-500 shadow-sm">
                Preparing a farmer-friendly answer...
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-gray-100 bg-white p-4 md:p-5">
            <div className="flex items-end gap-3">
              <textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                rows={3}
                placeholder="Type your farming question or tap Speak to ask by voice."
                className="min-h-[88px] flex-1 resize-none rounded-[24px] border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-green-400 focus:bg-white"
              />
              <button
                type="button"
                onClick={() => submitMessage(input)}
                disabled={isLoading || !input.trim()}
                className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-green-600 text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
