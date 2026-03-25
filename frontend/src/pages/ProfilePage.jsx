import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';
import { User, Phone, MapPin, Award, History, Settings, LogOut, Loader, Shield } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { logout } from '../features/authSlice';
import { useNavigate } from 'react-router-dom';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export default function ProfilePage() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, token } = useSelector((s) => s.auth);
  const [stats, setStats] = useState({ totalOrders: 0, activeTasks: 0, loyaltyPoints: 450 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // In production, fetch user stats from backend
    // setStats(...)
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
    toast.success(t('auth.logged_out'));
  };

  return (
    <Layout title={t('profile_title', 'My Profile')} subtitle={t('profile_sub', 'Manage your account, settings, and badges.')}>
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="space-y-6">
          <div className="bg-white rounded-[32px] p-8 shadow-clay-card border border-gray-100 text-center relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-br from-green-600 to-emerald-700 opacity-10" />
             <div className="relative">
                <div className="w-24 h-24 rounded-full bg-green-50 border-4 border-white shadow-lg mx-auto mb-4 flex items-center justify-center text-3xl font-black text-green-600">
                   {user?.name?.[0] || 'K'}
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-1 uppercase tracking-tight">{user?.name}</h3>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 rounded-full text-[10px] font-black uppercase tracking-wider mb-6">
                   <Shield size={10} /> {user?.role || 'FARMER'}
                </div>
                
                <div className="space-y-4 text-left">
                   <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl">
                      <Phone size={18} className="text-gray-400" />
                      <div>
                         <div className="text-[10px] text-gray-400 font-black uppercase">{t('phone_label', 'Phone')}</div>
                         <div className="font-bold text-gray-800">{user?.phone || 'Not provided'}</div>
                      </div>
                   </div>
                   <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl">
                      <MapPin size={18} className="text-gray-400" />
                      <div>
                         <div className="text-[10px] text-gray-400 font-black uppercase">{t('district_label', 'District')}</div>
                         <div className="font-bold text-gray-800">{user?.district || 'Hassan'}</div>
                      </div>
                   </div>
                </div>

                <button onClick={handleLogout} className="w-full mt-8 flex items-center justify-center gap-2 py-4 rounded-2xl bg-red-50 text-red-600 font-black hover:bg-red-100 transition-colors text-sm">
                   <LogOut size={16} /> {t('logout_btn', 'Logout')}
                </button>
             </div>
          </div>
          
          <div className="bg-amber-500 rounded-[32px] p-8 text-white shadow-xl shadow-amber-500/20">
             <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-2xl">🥇</div>
                <h3 className="text-lg font-black">{t('loyalty_club', 'Kisan Club')}</h3>
             </div>
             <p className="text-amber-50 text-sm mb-6">{t('loyalty_desc', 'You have earned 450 points from using Agri Shop and Farm Wizard. Redeem for discounts.')}</p>
             <div className="text-4xl font-black mb-1">450</div>
             <div className="text-[10px] uppercase font-black opacity-80 tracking-widest">{t('points_label', 'Points Available')}</div>
          </div>
        </div>

        {/* Settings & Statistics */}
        <div className="lg:col-span-2 space-y-6">
           <div className="grid md:grid-cols-2 gap-6">
              {[
                { label: t('active_tasks', 'Tasks'), value: '3', color: 'text-blue-600' },
                { label: t('placed_orders', 'Orders'), value: '12', color: 'text-green-600' },
                { label: t('earnings_mon', 'Revenue'), value: '₹14K', color: 'text-purple-600' },
                { label: t('successful_scans', 'Health Scans'), value: '28', color: 'text-rose-600' },
              ].map(s => (
                <div key={s.label} className="bg-white rounded-[28px] p-6 shadow-clay-card border border-gray-100">
                   <div className={`text-3xl font-black mb-1 ${s.color}`}>{s.value}</div>
                   <div className="text-sm text-gray-500 font-bold">{s.label}</div>
                </div>
              ))}
           </div>

           <div className="bg-white rounded-[32px] p-8 shadow-clay-card border border-gray-100">
              <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                 <Settings size={20} className="text-gray-400" /> {t('account_settings', 'Account Settings')}
              </h3>
              <div className="space-y-4">
                 {[
                   { label: t('notifications', 'Push Notifications'), status: 'Enabled' },
                   { label: t('voice_pref', 'Voice Feedback (Kannada)'), status: 'Active' },
                   { label: t('pwa_mode', 'Offline Data Storage'), status: 'Optimized' },
                   { label: t('security_2fa', 'Two-Factor Authentication'), status: 'Disabled' },
                 ].map(opt => (
                   <div key={opt.label} className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors group cursor-pointer">
                      <div className="font-bold text-gray-700 text-sm">{opt.label}</div>
                      <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${opt.status === 'Disabled' ? 'bg-red-50 text-red-500' : 'bg-green-100 text-green-700'}`}>
                         {opt.status}
                      </span>
                   </div>
                 ))}
              </div>
           </div>

           <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-[32px] p-8 text-white shadow-xl">
              <h3 className="text-xl font-black mb-2">{t('platform_updates', 'Software Updates')}</h3>
              <p className="text-gray-400 text-sm mb-6">{t('platform_ver', 'You are running KisaanKaJadoo v1.2.0 (Stable). All modules are synchronized with the cloud.')}</p>
              <div className="flex gap-4">
                 <div className="flex-1 p-4 bg-white/5 rounded-2xl border border-white/10 text-center">
                    <div className="text-xs font-black text-green-400 uppercase mb-1">{t('pwa_status', 'PWA')}</div>
                    <div className="text-sm font-bold">{t('uptodate', 'Up to date')}</div>
                 </div>
                 <div className="flex-1 p-4 bg-white/5 rounded-2xl border border-white/10 text-center">
                    <div className="text-xs font-black text-sky-400 uppercase mb-1">{t('voice_engine', 'Voice')}</div>
                    <div className="text-sm font-bold">{t('ready', 'Active')}</div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </Layout>
  );
}
