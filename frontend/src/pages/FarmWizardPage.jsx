import { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';
import { CloudSun, Sprout, TrendingUp, ArrowRight, Loader, MapPin, AlertCircle, AlertTriangle, Thermometer } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export default function FarmWizardPage() {
  const { t } = useTranslation();
  const STEPS = [t('step_0'), t('step_1'), t('step_2')];
  const { token } = useSelector((s) => s.auth);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ crop: 'wheat', acreage: '', soil: 'loamy', city: 'Delhi' });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [weatherAlert, setWeatherAlert] = useState(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const { data } = await axios.get(`${API}/api/weather/alerts?city=${form.city}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setWeatherAlert(data);
      } catch (e) {
        console.warn('Failed to fetch weather alerts');
      }
    };
    fetchWeather();
  }, [form.city]);

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const analyze = async () => {
    setLoading(true);
    try {
      const { data } = await axios.post(`${API}/api/farm/analyze`, form, { headers: { Authorization: `Bearer ${token}` } });
      setResult(data);
      setStep(2);
    } catch {
      toast.error(t('analysis_failed'));
    } finally { setLoading(false); }
  };

  const crops = ['wheat', 'rice', 'cotton', 'sugarcane', 'maize', 'soybean', 'groundnut'];

  return (
    <Layout title={t('wizard_title')} subtitle={t('wizard_sub')}>
      {/* Weather Smart Alert */}
      <AnimatePresence>
        {weatherAlert?.alert && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className={`mb-8 overflow-hidden rounded-[28px] border p-5 flex items-center justify-between gap-4 shadow-lg ${
              weatherAlert.alert.level === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-800' :
              weatherAlert.alert.level === 'caution' ? 'bg-orange-50 border-orange-200 text-orange-800' :
              'bg-blue-50 border-blue-200 text-blue-800'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-2xl ${
                weatherAlert.alert.level === 'warning' ? 'bg-amber-500' :
                weatherAlert.alert.level === 'caution' ? 'bg-orange-500' :
                'bg-blue-500'
              } text-white`}>
                {weatherAlert.alert.icon === 'cloud-rain' && <AlertTriangle size={20} />}
                {weatherAlert.alert.icon === 'thermometer' && <Thermometer size={20} />}
                {weatherAlert.alert.icon === 'sun' && <CloudSun size={20} />}
                {weatherAlert.alert.icon === 'wind' && <AlertCircle size={20} />}
              </div>
              <div>
                <h4 className="font-black text-sm uppercase tracking-wider mb-0.5">Smart Farming Alert</h4>
                <p className="text-sm font-semibold opacity-90">{weatherAlert.alert.message}</p>
              </div>
            </div>
            <div className="hidden md:block text-right">
              <div className="text-xl font-black">{weatherAlert.temp}°C</div>
              <div className="text-[10px] font-bold uppercase opacity-60 tracking-widest">{weatherAlert.condition}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress Tracker */}
      <div className="flex items-center gap-4 mb-10">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
              i < step ? 'bg-green-600 text-white shadow-lg shadow-green-500/20'
              : i === step ? 'bg-green-100 text-green-700 ring-2 ring-green-500'
              : 'bg-gray-100 text-gray-400'
            }`}>{i + 1}</div>
            <span className={`text-sm font-semibold ${i === step ? 'text-gray-900' : 'text-gray-400'}`}>{s}</span>
            {i < STEPS.length - 1 && <div className={`w-16 h-0.5 rounded-full ${i < step ? 'bg-green-500' : 'bg-gray-200'}`} />}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Step 0 — Crop Details */}
        {step === 0 && (
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-2 bg-white rounded-[32px] p-8 shadow-xl shadow-gray-100/50 border border-gray-100">
            <h2 className="text-2xl font-black text-gray-900 mb-8">{t('crop_header')}</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">{t('crop_type_label')}</label>
                <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                  {crops.map(c => (
                    <button key={c} onClick={() => setForm(f => ({ ...f, crop: c }))}
                      className={`py-3 px-4 rounded-2xl text-sm font-semibold capitalize transition-all border ${form.crop === c ? 'bg-green-600 text-white border-green-600 shadow-lg shadow-green-500/20' : 'bg-gray-50 text-gray-600 border-gray-100 hover:border-green-300'}`}>
                      {t(`crop_${c}`)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">{t('acreage_label')}</label>
                  <input name="acreage" type="number" value={form.acreage} onChange={handle} placeholder="e.g. 5.5" className="w-full px-5 py-4 rounded-2xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500/40 focus:border-green-500 transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">{t('soil_type_label')}</label>
                  <select name="soil" value={form.soil} onChange={handle} className="w-full px-5 py-4 rounded-2xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500/40 focus:border-green-500 transition-all appearance-none">
                    <option value="loamy">{t('soil_loamy')}</option>
                    <option value="sandy">{t('soil_sandy')}</option>
                    <option value="clay">{t('soil_clay')}</option>
                    <option value="silty">{t('soil_silty')}</option>
                  </select>
                </div>
              </div>
              <button onClick={() => setStep(1)} disabled={!form.acreage} className="mt-2 flex items-center gap-2 bg-green-600 text-white font-bold px-8 py-4 rounded-2xl hover:bg-green-700 transition-colors disabled:opacity-40 shadow-lg shadow-green-500/20">
                {t('next_location')} <ArrowRight size={18} />
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 1 — Location */}
        {step === 1 && (
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-2 bg-white rounded-[32px] p-8 shadow-xl shadow-gray-100/50 border border-gray-100">
            <h2 className="text-2xl font-black text-gray-900 mb-8">{t('location_header')}</h2>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">{t('city_label')}</label>
              <input name="city" value={form.city} onChange={handle} placeholder="e.g. Chandigarh" className="w-full px-5 py-4 rounded-2xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500/40 focus:border-green-500 transition-all" />
              <p className="text-gray-400 text-sm mt-2">{t('city_helper')}</p>
            </div>
            <div className="flex gap-4 mt-8">
              <button onClick={() => setStep(0)} className="px-6 py-3 rounded-2xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-colors">{t('back_btn')}</button>
              <button onClick={analyze} disabled={loading} className="flex items-center gap-2 bg-green-600 text-white font-bold px-8 py-4 rounded-2xl hover:bg-green-700 transition-colors disabled:opacity-60 shadow-lg shadow-green-500/20">
                {loading ? <><Loader size={16} className="animate-spin" /> {t('analyzing_btn')}</> : <>{t('run_analysis_btn')} <ArrowRight size={18} /></>}
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 2 — Results */}
        {step === 2 && result && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="lg:col-span-3 grid md:grid-cols-3 gap-6">
            {[
              { icon: '🌾', label: t('est_yield'), value: `${result.estimatedYield} kg`, desc: `For ${form.acreage} acres of ${t(`crop_${form.crop}`)}`, color: 'green' },
              { icon: '💰', label: t('market_value'), value: `₹${result.marketValue?.toLocaleString('en-IN')}`, desc: 'At current MSP rates', color: 'blue' },
              { icon: '☁️', label: t('curr_weather'), value: `${result.weather?.temp}°C`, desc: result.weather?.description, color: 'purple' },
            ].map(({ icon, label, value, desc, color }) => (
              <div key={label} className="bg-white rounded-[28px] p-8 shadow-xl shadow-gray-100/50 border border-gray-100">
                <div className={`w-14 h-14 rounded-2xl bg-${color}-50 flex items-center justify-center text-2xl mb-6 shadow-inner`}>{icon}</div>
                <div className="text-3xl font-black text-gray-900 mb-1">{value}</div>
                <div className="text-sm font-bold text-gray-700 mb-1">{label}</div>
                <div className="text-xs text-gray-400">{desc}</div>
              </div>
            ))}

            {result.recommendations?.length > 0 && (
              <div className="md:col-span-3 bg-white rounded-[28px] p-8 shadow-xl shadow-gray-100/50 border border-gray-100">
                <h3 className="font-black text-gray-900 text-xl mb-6">{t('ai_recs')}</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {result.recommendations.map((r, i) => (
                    <div key={i} className="flex items-start gap-3 p-4 bg-green-50 rounded-2xl">
                      <div className="w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">{i+1}</div>
                      <p className="text-sm text-gray-700">{r}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Regional Insights */}
            {(form.city?.toLowerCase().includes('hassan') || form.city?.toLowerCase().includes('tumkur')) && (
              <div className="md:col-span-3 bg-gradient-to-r from-sky-500 to-blue-600 rounded-[28px] p-8 text-white shadow-xl shadow-sky-500/20">
                <div className="flex items-center gap-3 mb-4">
                  <MapPin size={24} className="text-sky-100" />
                  <h3 className="font-black text-xl">{t('regional_insights_header', 'Localized Regional Insights')}</h3>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  {form.city.toLowerCase().includes('hassan') && (
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20">
                      <h4 className="font-bold mb-2 flex items-center gap-2">🔬 {t('org_kvk')}</h4>
                      <p className="text-xs text-sky-50 leading-relaxed">Attention Hassan farmers! KVK Kandali suggests monitoring Copper and Zinc levels in your soil this season for better yield stability.</p>
                    </div>
                  )}
                  {form.city.toLowerCase().includes('tumkur') && (
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20">
                      <h4 className="font-bold mb-2 flex items-center gap-2">🌿 {t('reg_tumkur')} AI Recommendation</h4>
                      <p className="text-xs text-sky-50 leading-relaxed">Consider visiting Aikantika for a 3-day Natural Farming workshop to reduce dependency on synthetic fertilizers.</p>
                    </div>
                  )}
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20">
                    <h4 className="font-bold mb-2 flex items-center gap-2">📦 {t('org_sahaja')}</h4>
                    <p className="text-xs text-sky-50 leading-relaxed">Available nearby! Explore 800+ indigenous rice varieties for drought resistance and high nutritional value.</p>
                  </div>
                </div>
              </div>
            )}

            <div className="md:col-span-3 flex gap-4">
              <button onClick={() => { setStep(0); setResult(null); }} className="px-6 py-3 rounded-2xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-colors">{t('new_analysis')}</button>
            </div>
          </motion.div>
        )}

        {/* Sidebar Tips */}
        {step < 2 && (
          <div className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-[32px] p-8 text-white shadow-xl shadow-green-500/20 self-start">
            <CloudSun size={32} className="mb-4 opacity-80" />
            <h3 className="font-black text-lg mb-4">{t('what_you_get')}</h3>
            <ul className="space-y-3 text-green-50 text-sm">
              {[t('tip_1'), t('tip_2'), t('tip_3'), t('tip_4'), t('tip_5')].map(t => (
                <li key={t} className="flex items-start gap-2"><Sprout size={14} className="shrink-0 mt-0.5" />{t}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Layout>
  );
}
