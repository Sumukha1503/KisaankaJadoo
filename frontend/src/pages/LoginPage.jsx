import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../features/authSlice';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Leaf, Eye, EyeOff, ArrowRight, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'FARMER', phone: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url = isRegister ? '/api/auth/register' : '/api/auth/login';
      const payload = isRegister ? form : { email: form.email, password: form.password };
      const { data } = await axios.post(`${API}${url}`, payload);
      dispatch(setCredentials({ token: data.token, role: data.user.role, name: data.user.name }));
      toast.success(`Welcome back, ${data.user.name}! 🌾`);
      
      // Role-based redirection
      switch (data.user.role) {
        case 'ADMIN': navigate('/analytics'); break;
        case 'LABOUR': navigate('/labour'); break;
        case 'VEHICLE_OWNER': navigate('/vehicles'); break;
        case 'VENDOR':
        case 'STORE_OWNER': navigate('/vendors'); break;
        default: navigate('/farm-wizard');
      }
    } catch (err) {
      const msg = err?.response?.data?.error || err?.response?.data?.message || 'Something went wrong';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#f8fbfa] text-gray-900">
      {/* Left Panel */}
      <div
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1400&q=80')", backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-green-950/80 via-green-900/60 to-transparent" />
        <div className="relative z-10 flex flex-col justify-between p-14 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
              <Leaf size={20} />
            </div>
            <span className="text-2xl font-black tracking-tight">KisaanKaJadoo</span>
          </div>
          <div>
            <h2 className="text-5xl font-black mb-6 leading-tight">The Future <br/>of Farming <br/>Starts Here.</h2>
            <p className="text-green-100 text-lg leading-relaxed max-w-md">
              Connect to labour markets, AI-powered disease scanning, vehicle rentals, and bulk vendor trading—all in one unified platform.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl px-6 py-3 border border-white/20">
              <div className="text-2xl font-black">25,000+</div>
              <div className="text-green-200 text-sm">Farmers on Platform</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl px-6 py-3 border border-white/20">
              <div className="text-2xl font-black">+30%</div>
              <div className="text-green-200 text-sm">Yield Boost</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="mb-10">
            <div className="flex items-center justify-between mb-8">
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 text-gray-400 hover:text-gray-700 text-sm font-semibold transition-colors group"
              >
                <span className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center group-hover:border-green-400 group-hover:text-green-600 transition-colors">
                  ←
                </span>
                {t('back_home')}
              </button>
              
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-xl bg-gray-100 border border-transparent">
                  <Globe size={14} className="text-gray-400" />
                  <select 
                    value={i18n.language} 
                    onChange={(e) => i18n.changeLanguage(e.target.value)}
                    className="bg-transparent text-[10px] font-bold outline-none cursor-pointer"
                  >
                    <option value="en" className="text-gray-900">English</option>
                    <option value="hi" className="text-gray-900">हिन्दी</option>
                    <option value="kn" className="text-gray-900">ಕನ್ನಡ</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 lg:hidden mb-8">
              <Leaf size={24} className="text-green-600" />
              <span className="text-xl font-black text-gray-900">KisaanKaJadoo</span>
            </div>
            <h1 className="text-4xl font-black text-gray-900 mb-2">
              {isRegister ? t('register_title') : t('login_title')}
            </h1>
            <p className="text-gray-500">{isRegister ? t('register_sub') : t('login_sub')}</p>
          </div>

          <form onSubmit={submit} className="space-y-5">
            {isRegister && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">{t('name_label')}</label>
                <input name="name" value={form.name} onChange={handle} required placeholder="Ramesh Kumar" className="w-full px-5 py-4 rounded-2xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/40 focus:border-green-500 transition-all" />
              </div>
            )}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">{t('email_label')}</label>
              <input name="email" type="email" value={form.email} onChange={handle} required placeholder="farmer@mail.com" className="w-full px-5 py-4 rounded-2xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/40 focus:border-green-500 transition-all" />
            </div>
            {isRegister && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">{t('phone_label')}</label>
                <input name="phone" value={form.phone} onChange={handle} required placeholder="9876543210" className="w-full px-5 py-4 rounded-2xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/40 focus:border-green-500 transition-all" />
              </div>
            )}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">{t('pw_label')}</label>
              <div className="relative">
                <input name="password" type={showPw ? 'text' : 'password'} value={form.password} onChange={handle} required placeholder="••••••••" className="w-full px-5 py-4 rounded-2xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/40 focus:border-green-500 transition-all pr-12" />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700">
                  {showPw ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            {isRegister && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">{t('role_label')}</label>
                <select name="role" value={form.role} onChange={handle} className="w-full px-5 py-4 rounded-2xl border border-gray-200 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500/40 focus:border-green-500 transition-all appearance-none">
                  <option value="FARMER" className="text-gray-900">🌾 Farmer</option>
                  <option value="LABOUR" className="text-gray-900">👷 Labour</option>
                  <option value="VENDOR" className="text-gray-900">🏪 Vendor</option>
                  <option value="STORE_OWNER" className="text-gray-900">🏬 Store Owner</option>
                  <option value="VEHICLE_OWNER" className="text-gray-900">🚜 Vehicle Owner</option>
                </select>
              </div>
            )}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-green-600 text-white font-bold py-4 rounded-2xl hover:bg-green-700 transition-colors shadow-lg shadow-green-500/20 disabled:opacity-60"
            >
              {loading ? 'Please wait...' : (isRegister ? t('register_title') : t('login'))}
              {!loading && <ArrowRight size={18} />}
            </motion.button>
          </form>

          <p className="text-center text-gray-500 mt-8">
            {isRegister ? t('have_account') : t('no_account')}{' '}
            <button onClick={() => setIsRegister(!isRegister)} className="text-green-600 font-bold hover:text-green-700">
              {isRegister ? t('login') : t('register')}
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
