import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { logout } from '../features/authSlice';
import {
  Leaf, LayoutDashboard, ShoppingCart, Scan,
  Users, Truck, TrendingUp, LogOut, Menu, X,
  ChevronRight, Tractor, Bell, Globe, BookOpen, Mic, HeartPulse, Shield, User, Bot
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useVoice } from '../hooks/useVoice';

const getNavLinks = (t, role) => {
  const allLinks = [
    { to: '/farm-wizard', icon: LayoutDashboard, label: t('nav.wizard'), emoji: '🌾', roles: ['FARMER'] },
    { to: '/scanner', icon: Scan, label: t('nav.scanner'), emoji: '🤖', roles: ['FARMER'] },
    { to: '/shop', icon: ShoppingCart, label: t('nav.shop'), emoji: '🛒', roles: ['FARMER'] },
    { to: '/admin', icon: Shield, label: t('nav.admin', 'Admin Dashboard'), emoji: '👑', roles: ['ADMIN'] },
    { to: role === 'ADMIN' ? '/manage?category=LABOUR' : '/labour', icon: Users, label: t('nav.labour'), emoji: '👷', roles: ['FARMER', 'LABOUR', 'ADMIN'] },
    { to: role === 'ADMIN' ? '/manage?category=VEHICLE_OWNER' : '/vehicles', icon: Truck, label: t('nav.vehicles'), emoji: '🚜', roles: ['FARMER', 'VEHICLE_OWNER', 'ADMIN'] },
    { to: role === 'ADMIN' ? '/manage?category=STORE_OWNER' : '/vendors', icon: Tractor, label: t('nav.vendors'), emoji: '🏪', roles: ['FARMER', 'STORE_OWNER', 'VENDOR', 'ADMIN'] },
    { to: '/assistant', icon: Bot, label: t('nav.assistant', 'AI Sahayak'), emoji: '🗣️', roles: ['FARMER', 'ADMIN', 'LABOUR', 'STORE_OWNER', 'VENDOR', 'VEHICLE_OWNER'] },
    { to: '/welfare', icon: HeartPulse, label: t('nav.welfare', 'Welfare Hub'), emoji: '🏥', roles: ['FARMER', 'ADMIN', 'LABOUR'] },
    { to: '/manage', icon: Shield, label: t('nav.manage', 'My Business'), emoji: '🛡️', roles: ['FARMER', 'STORE_OWNER', 'VEHICLE_OWNER', 'VENDOR', 'LABOUR'] },
    { to: '/profile', icon: User, label: t('nav.profile', 'Profile'), emoji: '👤', roles: ['FARMER', 'STORE_OWNER', 'VEHICLE_OWNER', 'VENDOR', 'ADMIN', 'LABOUR'] },
    { to: '/analytics', icon: TrendingUp, label: t('nav.analytics'), emoji: '📊', roles: ['FARMER', 'ADMIN', 'LABOUR', 'STORE_OWNER', 'VENDOR', 'VEHICLE_OWNER'] },
    { to: '/knowledge', icon: BookOpen, label: t('nav.knowledge'), emoji: '📚', roles: ['FARMER', 'ADMIN'] },
  ];

  if (!role) return [];
  return allLinks.filter(link => link.roles.includes(role));
};

function Sidebar({ open, onClose }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { name, role } = useSelector((s) => s.auth);
  const { t, i18n } = useTranslation();
  
  const initials = name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'KK';
  const handleLogout = () => { dispatch(logout()); navigate('/'); };

  const NAV_LINKS = getNavLinks(t, role);

  return (
    <aside className="h-full w-64 flex flex-col bg-white border-r border-gray-100 transition-colors">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100 shrink-0">
        <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-green-600 to-emerald-400 flex items-center justify-center shadow-md shadow-green-200">
          <Leaf size={17} className="text-white" />
        </div>
        <span className="text-base font-black tracking-tight text-gray-900">KisaanKaJadoo</span>
        {onClose && (
          <button onClick={onClose} className="ml-auto p-1 rounded-lg hover:bg-gray-100 text-gray-400">
            <X size={18} />
          </button>
        )}
      </div>

      {/* Language Toggle — Mobile Visibility */}
      <div className="lg:hidden px-4 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <Globe size={18} className="text-gray-400" />
          <select 
            value={i18n.language} 
            onChange={(e) => i18n.changeLanguage(e.target.value)}
            className="bg-transparent text-sm font-bold text-gray-700 outline-none"
          >
            <option value="en">English</option>
            <option value="hi">हिन्दी</option>
            <option value="kn">ಕನ್ನಡ</option>
          </select>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {NAV_LINKS.map(({ to, label, emoji }) => {
          const active = pathname === to;
          return (
            <Link key={to} to={to} onClick={onClose}>
              <motion.div
                whileHover={{ x: active ? 0 : 5 }}
                whileTap={{ scale: 0.97 }}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all cursor-pointer ${
                  active ? 'bg-green-600 text-white shadow-lg shadow-green-500/25' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <span className="text-base leading-none">{emoji}</span>
                <span className="flex-1">{label}</span>
                {active && <ChevronRight size={13} className="opacity-70" />}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div className="shrink-0 border-t border-gray-100 p-3 space-y-2">
        <div className="flex items-center gap-3 px-3 py-3 rounded-2xl bg-gray-50">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-black text-sm shadow-sm shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-900 truncate">{name || 'Farmer'}</p>
            <p className="text-xs text-gray-400 truncate capitalize">{role?.toLowerCase().replace('_', ' ')}</p>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-red-50 text-red-600 hover:bg-red-100 font-bold text-sm transition-all border border-red-100"
        >
          <LogOut size={15} /> {t('logout')}
        </motion.button>
      </div>
    </aside>
  );
}

export default function Layout({ children, title, subtitle }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { pathname } = useLocation();
  const { name } = useSelector((s) => s.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation();
  const { isListening, startListening } = useVoice();

  const voiceLanguage = i18n.language === 'hi' ? 'hi-IN' : i18n.language === 'kn' ? 'kn-IN' : 'en-IN';

  const { role } = useSelector(s => s.auth);
  const handleVoiceCommand = (text) => {
    const cmd = text.toLowerCase();
    const NAV_LINKS = getNavLinks(t, role);
    const canNav = (path) => NAV_LINKS.some(l => l.to === path);

    if (canNav('/shop') && ['shop', 'store', 'buy', 'दुकान', 'खरीद', 'ಅಂಗಡಿ', 'ಖರೀದಿ'].some((keyword) => cmd.includes(keyword))) navigate('/shop');
    else if (canNav('/farm-wizard') && ['wizard', 'guide', 'plan', 'योजना', 'सलाह', 'ಮಾರ್ಗದರ್ಶನ', 'ಯೋಜನೆ'].some((keyword) => cmd.includes(keyword))) navigate('/farm-wizard');
    else if (canNav('/scanner') && ['scanner', 'disease', 'check', 'बीमारी', 'रोग', 'ಸ್ಕ್ಯಾನರ್', 'ರೋಗ'].some((keyword) => cmd.includes(keyword))) navigate('/scanner');
    else if (canNav('/labour') && ['labour', 'worker', 'मजदूर', 'कामगार', 'ಕಾರ್ಮಿಕ', 'ಕೆಲಸಗಾರ'].some((keyword) => cmd.includes(keyword))) navigate('/labour');
    else if (canNav('/vehicles') && ['vehicle', 'tractor', 'वाहन', 'ट्रैक्टर', 'ವಾಹನ', 'ಟ್ರಾಕ್ಟರ್'].some((keyword) => cmd.includes(keyword))) navigate('/vehicles');
    else if (canNav('/vendors') && ['market', 'vendor', 'sell', 'बाजार', 'विक्रेता', 'ಮಾರುಕಟ್ಟೆ', 'ಮಾರಾಟ'].some((keyword) => cmd.includes(keyword))) navigate('/vendors');
    else if (canNav('/analytics') && ['analytics', 'data', 'रिपोर्ट', 'डेटा', 'ಡೇಟಾ', 'ವರದಿ'].some((keyword) => cmd.includes(keyword))) navigate('/analytics');
    else if (canNav('/knowledge') && ['knowledge', 'hub', 'जानकारी', 'सीख', 'ಮಾಹಿತಿ', 'ಜ್ಞಾನ'].some((keyword) => cmd.includes(keyword))) navigate('/knowledge');
    else if (canNav('/assistant') && ['assistant', 'help', 'सहायक', 'मदद', 'ಸಹಾಯಕ', 'ಸಹಾಯ'].some((keyword) => cmd.includes(keyword))) navigate('/assistant');
    else if (cmd.includes('logout') || cmd.includes('sign out') || cmd.includes('लॉगआउट') || cmd.includes('ಲಾಗೌಟ್')) handleLogout();
  };

  const initials = name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'KK';
  const handleLogout = () => { dispatch(logout()); navigate('/'); };

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  return (
    <div className="flex h-screen overflow-hidden bg-[#f4f7f4]">

      {/* ── DESKTOP SIDEBAR ── */}
      <div className="hidden lg:flex shrink-0">
        <Sidebar open={true} onClose={null} />
      </div>

      {/* ── MOBILE SIDEBAR ── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div key="backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div key="sidebar" initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 280 }}
              className="fixed top-0 left-0 h-full z-50 lg:hidden shadow-2xl"
            >
              <Sidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top Bar */}
        <header className="shrink-0 bg-white/90 backdrop-blur-lg border-b border-gray-100 px-4 md:px-7 h-16 flex items-center gap-3 z-30 shadow-sm transition-colors">
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => setMobileOpen(true)}
            className="lg:hidden p-2 rounded-xl hover:bg-gray-100 text-gray-500 shrink-0">
            <Menu size={21} />
          </motion.button>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              {title && <h1 className="text-base md:text-lg font-black text-gray-900 truncate">{title}</h1>}
              <span className="px-2 py-0.5 rounded-md bg-green-100 text-green-700 text-[10px] font-bold uppercase tracking-wider border border-green-200">
                {useSelector(s => s.auth.role) || 'GUEST'}
              </span>
            </div>
            {subtitle && <p className="text-xs text-gray-400 truncate hidden sm:block">{subtitle}</p>}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Language Toggle (Desktop) */}
            <div className="hidden lg:flex items-center gap-4 mr-4">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-50 border border-gray-100">
                <Globe size={14} className="text-gray-400" />
                <select 
                  value={i18n.language} 
                  onChange={(e) => i18n.changeLanguage(e.target.value)}
                  className="bg-transparent text-xs font-bold text-gray-700 outline-none cursor-pointer"
                >
                  <option value="en">English</option>
                  <option value="hi">हिन्दी</option>
                  <option value="kn">ಕನ್ನಡ</option>
                </select>
              </div>
            </div>

            <motion.button 
              whileTap={{ scale: 0.9 }} 
              onClick={() => navigate('/assistant', { state: { autoMic: true } })}
              className={`relative p-2.5 rounded-xl transition-all ${isListening ? 'bg-red-100 text-red-600 shadow-lg shadow-red-200 animate-pulse' : 'hover:bg-gray-100 text-gray-500'}`}
            >
              {isListening ? <Mic size={18} /> : <Mic size={18} />}
            </motion.button>

            <motion.button whileTap={{ scale: 0.9 }} className="relative p-2.5 rounded-xl hover:bg-gray-100 text-gray-500">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-green-500 rounded-full ring-1 ring-white" />
            </motion.button>

            <div className="hidden md:flex items-center gap-2 pl-3 border-l border-gray-100 ml-1">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-black text-xs shadow-sm">
                {initials}
              </div>
              <span className="text-sm font-semibold text-gray-700 max-w-[90px] truncate">{name || 'Farmer'}</span>
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.95 }} onClick={handleLogout}
                className="ml-1 flex items-center gap-1.5 py-2 px-3 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 font-bold text-xs transition-all border border-red-100">
                <LogOut size={12} /> {t('logout')}
              </motion.button>
            </div>

            {/* Mobile sign out */}
            <motion.button whileTap={{ scale: 0.9 }} onClick={handleLogout}
              className="md:hidden p-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 border border-red-100">
              <LogOut size={17} />
            </motion.button>
          </div>
        </header>

        {/* Page Body */}
        <main className="flex-1 overflow-y-auto bg-gray-50/50 transition-colors">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="p-4 md:p-7 max-w-[1320px] mx-auto"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
