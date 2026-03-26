import { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Languages, MessageSquare, Mic, Send, Sparkles, Tractor, Volume2, X } from 'lucide-react';
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

function VoiceVisualizer({ state }) {
  const isActive = state === 'listening' || state === 'speaking';
  
  return (
    <div className="relative flex items-center justify-center w-32 h-32 mx-auto mb-8">
      <AnimatePresence>
        {isActive && [1, 2, 3].map((i) => (
          <motion.div
            key={i}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 2, opacity: 0 }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.6,
              ease: "easeOut"
            }}
            className="absolute inset-0 rounded-full border-2 border-emerald-400/30"
          />
        ))}
      </AnimatePresence>

      <motion.div
        animate={{
          scale: state === 'listening' ? [1, 1.15, 1] : state === 'speaking' ? [1, 1.08, 1] : 1,
          boxShadow: state === 'listening' 
            ? ["0 0 0px rgba(16, 185, 129, 0)", "0 0 40px rgba(16, 185, 129, 0.4)", "0 0 0px rgba(16, 185, 129, 0)"]
            : ["0 0 0px rgba(255, 255, 255, 0)", "0 0 20px rgba(255, 255, 255, 0.2)", "0 0 0px rgba(255, 255, 255, 0)"]
        }}
        transition={{
          duration: state === 'listening' ? 1.5 : 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center shadow-2xl transition-colors duration-500 ${
          state === 'listening' 
            ? 'bg-gradient-to-tr from-emerald-500 to-green-400 border-4 border-white/40' 
            : state === 'speaking'
            ? 'bg-gradient-to-tr from-sky-400 to-blue-500 border-4 border-white/40'
            : 'bg-white/10 backdrop-blur-md border border-white/20'
        }`}
      >
        <Sparkles size={32} className={state === 'idle' ? 'text-white/40' : 'text-white'} />
      </motion.div>
    </div>
  );
}

function ThinkingDots() {
  return (
    <div className="flex gap-1 items-center px-1">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
          className="w-1.5 h-1.5 rounded-full bg-emerald-400"
        />
      ))}
    </div>
  );
}

export default function AssistantPage() {
  const { token, role } = useSelector((state) => state.auth);
  const [language, setLanguage] = useState('en-IN');
  const [messages, setMessages] = useState([{ role: 'assistant', content: GREETING['en-IN'] }]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceParams, setVoiceParams] = useState({});
  const navigate = useNavigate();
  const { isListening, startListening } = useVoice();
  const location = useLocation();
  const messagesEndRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    if (location.state?.autoMic) {
      startVoiceInput();
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

  const stopSpeaking = () => {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    setIsSpeaking(false);
  };

  const speakFallback = (text, autoListen = false) => {
    if (!window.speechSynthesis || !text) return;
    stopSpeaking();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;
    utterance.voice = getSpeechVoice(language);
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      if (autoListen) setTimeout(startVoiceInput, 300);
    };
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const speakText = async (text, autoListen = false) => {
    if (!text) return;
    try {
      setIsSpeaking(true);
      const { data } = await axios.post(
        `${API}/api/ai/assistant/speak`,
        { text, language },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.audioBase64) {
        stopSpeaking();
        const audio = new Audio(`data:${data.mimeType || 'audio/wav'};base64,${data.audioBase64}`);
        audioRef.current = audio;
        audio.onended = () => {
          setIsSpeaking(false);
          audioRef.current = null;
          if (autoListen) setTimeout(startVoiceInput, 300);
        };
        audio.onerror = (e) => {
          console.error('Audio object error:', e);
          setIsSpeaking(false);
          audioRef.current = null;
          speakFallback(text, autoListen);
        };
        try {
          await audio.play();
        } catch (playError) {
          console.error('Audio play failed:', playError);
          setIsSpeaking(false);
          speakFallback(text, autoListen);
        }
        return;
      }

      setIsSpeaking(false);
      speakFallback(data.text || text, autoListen);
    } catch (error) {
      setIsSpeaking(false);
      speakFallback(text, autoListen);
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
          role,
          history: nextMessages.slice(-8),
          currentParams: voiceParams
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.params) {
        setVoiceParams((prev) => ({ ...prev, ...data.params }));
      }

      setMessages((current) => [...current, { role: 'assistant', content: data.reply }]);
      
      const isQuestion = !data.action?.route;
      speakText(data.reply, isQuestion);

      if (data.action?.route) {
        toast.success(data.action.label || 'Opening the suggested tool');
        const finalParams = { ...voiceParams, ...data.params };
        setTimeout(() => navigate(data.action.route, { state: { voiceParams: finalParams } }), 1200);
        setVoiceParams({});
      }
    } catch (error) {
      console.error('Chat error:', error);
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
            <VoiceVisualizer state={isListening ? 'listening' : isSpeaking ? 'speaking' : 'idle'} />
            
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-2">
                {isListening ? 'Listening...' : isSpeaking ? 'Speaking...' : 'Agri-Voice Advisor'}
              </h3>
              <p className="text-emerald-50/80 text-sm">
                Your direct AI connection for smarter farming.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={isListening || isSpeaking ? stopSpeaking : startVoiceInput}
                className={`flex-1 h-14 rounded-2xl flex items-center justify-center gap-3 font-semibold transition-all shadow-lg ${
                  isListening || isSpeaking
                    ? 'bg-white/20 border-2 border-white/40 hover:bg-white/30 text-white'
                    : 'bg-white text-emerald-600 hover:bg-emerald-50'
                }`}
              >
                {isListening || isSpeaking ? (
                  <>
                    <X size={24} />
                    Stop
                  </>
                ) : (
                  <>
                    <Mic size={24} />
                    Start Talking
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="bg-white rounded-[32px] border border-emerald-100 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4 text-emerald-800 font-semibold">
              <Languages size={20} className="text-emerald-500" />
              Change Language
            </div>
            <div className="space-y-2">
              {LANGUAGE_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setLanguage(opt.id)}
                  className={`w-full p-4 rounded-2xl text-left transition-all border-2 ${
                    language === opt.id
                      ? 'bg-emerald-50 border-emerald-400 text-emerald-900 shadow-sm'
                      : 'border-transparent hover:bg-gray-50 text-gray-600'
                  }`}
                >
                  <div className="font-bold">{opt.label}</div>
                  <div className="text-xs opacity-70 mt-0.5">{opt.hint}</div>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="flex flex-col h-[600px] xl:h-[700px] bg-white rounded-[32px] border border-emerald-100 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                <Bot size={24} />
              </div>
              <div>
                <div className="font-bold text-gray-900">Virtual Agri-Consultant</div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs text-emerald-600 font-medium uppercase tracking-wider">Online</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setMessages([{ role: 'assistant', content: GREETING[language] }])}
                className="p-2 hover:bg-white rounded-xl text-gray-400 hover:text-emerald-500 transition-colors border border-transparent hover:border-emerald-100"
              >
                <MessageSquare size={20} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">
            {messages.map((msg, idx) => (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-[24px] px-5 py-4 shadow-sm ${
                    msg.role === 'user'
                      ? 'bg-emerald-600 text-white rounded-br-none'
                      : 'bg-gray-50 text-gray-800 rounded-bl-none border border-gray-100'
                  }`}
                >
                  <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                </div>
              </motion.div>
            ))}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="bg-gray-50 border border-gray-100 rounded-[20px] rounded-bl-none px-4 py-3">
                  <ThinkingDots />
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 bg-gray-50/50 border-t border-gray-100">
            {messages.length < 3 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {quickActions.map((action, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setInput(action);
                      submitMessage(action);
                    }}
                    className="px-4 py-2 bg-white border border-emerald-100 rounded-full text-sm text-emerald-700 hover:bg-emerald-50 hover:border-emerald-200 transition-all font-medium shadow-sm"
                  >
                    {action}
                  </button>
                ))}
              </div>
            )}
            
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && submitMessage(input)}
                placeholder="Type your question here..."
                className="flex-1 h-14 bg-white border border-gray-200 rounded-2xl px-6 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-inner"
              />
              <button
                onClick={() => submitMessage(input)}
                disabled={isLoading || !input.trim()}
                className="w-14 h-14 bg-emerald-600 rounded-2xl flex items-center justify-center text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg active:scale-95"
              >
                <Send size={24} />
              </button>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
