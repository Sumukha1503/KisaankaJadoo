import { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { useLocation as useLocationRouter, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';
import { MapPin, Truck, ArrowRight, Loader, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { useLocation } from '../hooks/useLocation';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export default function VehiclePage() {
  const { t } = useTranslation();
  const { coords } = useLocation();
  const locationRouter = useLocationRouter();
  const voiceParams = locationRouter.state?.voiceParams;
  const { token } = useSelector((s) => s.auth);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(voiceParams?.type ? `type_${voiceParams.type.toLowerCase()}` : 'type_all');

  useEffect(() => {
    setLoading(true);
    const url = coords && coords.lat && coords.lng 
      ? `${API}/api/vehicles?lat=${coords.lat}&lng=${coords.lng}`
      : `${API}/api/vehicles`;
      
    axios.get(url, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => setVehicles(r.data))
      .catch(() => setVehicles([]))
      .finally(() => setLoading(false));
  }, [coords, token]);

  const types = ['type_all', 'type_tractor', 'type_harvester', 'type_tanker', 'type_equipment'];
  const filtered = filter === 'type_all' ? vehicles : vehicles.filter(v => `type_${v.type?.toLowerCase()}` === filter);

  const [showSuccess, setShowSuccess] = useState(false);
  const [bookedVehicle, setBookedVehicle] = useState(null);

  const book = async (v) => {
    try {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(startDate.getDate() + 1);
      const hours = 24;
      const rate = v.ratePerHour || v.pricePerDay || 1000;
      const totalAmount = rate * (v.ratePerHour ? hours : 1);
      const depositAmount = Math.floor(totalAmount * 0.2);

      await axios.post(`${API}/api/vehicles/book`, { 
        vehicleId: v._id, 
        startDate, 
        endDate, 
        hours, 
        totalAmount, 
        depositAmount 
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      setBookedVehicle(v);
      setShowSuccess(true);
      toast.success(t('vehicle_booked', { name: v.name }));
      
      // Update local state to hide the rented vehicle
      setVehicles(prev => prev.filter(item => item._id !== v._id));
    } catch (err) {
      console.error('Booking failed:', err);
      toast.error(t('booking_failed') || 'Failed to send booking request');
    }
  };

  const { role } = useSelector((s) => s.auth);
  const navigate = useNavigate();

  return (
    <Layout title={t('vehicle_title')} subtitle={t('vehicle_sub')}>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div className="flex gap-3 flex-wrap">
          {types.map(vType => (
            <button key={vType} onClick={() => setFilter(vType)}
              className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all border ${filter === vType ? 'bg-green-600 text-white border-green-600 shadow-lg shadow-green-500/20' : 'bg-white text-gray-600 border-gray-200 hover:border-green-300'}`}>
              {vType.startsWith('type_') ? t('vehicle.' + vType) : t(vType)}
            </button>
          ))}
        </div>
        {(role === 'VEHICLE_OWNER' || role === 'ADMIN') && (
          <button onClick={() => navigate('/manage')} className="flex items-center gap-2 bg-blue-600 text-white font-bold px-6 py-2.5 rounded-2xl hover:bg-blue-700 transition-colors text-sm shadow-lg shadow-blue-500/20">
            <Plus size={16} /> {t('add_vehicle_btn', 'Add Vehicle')}
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-gray-400"><Loader size={24} className="animate-spin mr-3" />{t('loading_vehicles')}</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.length === 0 ? (
             <div className="col-span-full py-20 text-center text-gray-400">{t('no_vehicles')}</div>
          ) : filtered.map((v, i) => (
            <motion.div key={v._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              className="bg-white rounded-[28px] overflow-hidden shadow-xl shadow-gray-100/50 border border-gray-100">
              <div className="relative h-48 bg-gray-100 overflow-hidden">
                <img src={v.imageUrl || v.image} alt={v.name} className="w-full h-full object-cover" />
                <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold ${v.available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                  {v.available ? `✓ ${t('available')}` : `✗ ${t('booked')}`}
                </div>
              </div>
              <div className="p-6">
                <div className="inline-block bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1 rounded-full mb-3">
                  <Truck size={11} className="inline mr-1" />{t(`type_${v.type?.toLowerCase()}`)}
                </div>
                <h3 className="font-black text-gray-900 mb-1">{v.name}</h3>
                <div className="flex items-center gap-1 text-gray-400 text-sm mb-4">
                  <MapPin size={13} /> {v.district || v.location?.district || 'Nearby'}
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-2xl font-black text-gray-900">₹{(v.ratePerHour || v.pricePerDay || 0).toLocaleString('en-IN')}</span>
                    <span className="text-gray-400 text-sm">/{v.ratePerHour ? t('hr_unit') : t('day_unit')}</span>
                  </div>
                  <button disabled={!v.available} onClick={() => book(v)}
                    className="flex items-center gap-1.5 bg-gray-900 text-white font-bold px-5 py-2.5 rounded-2xl hover:bg-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-sm">
                    {t('book_btn')} <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
      {showSuccess && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-[32px] p-8 max-w-sm w-full text-center shadow-2xl">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-10 h-10"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-2">{t('booking_confirmed', 'Booking Confirmed!') || 'Confirmed!'}</h2>
            <p className="text-gray-500 mb-6">{t('booking_confirmed_sub', 'Check your email for details and tracking info.') || 'A confirmation email has been sent.'}</p>
            
            <div className="bg-gray-50 rounded-2xl p-4 mb-6 text-left border border-gray-100">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{t('booked_item', 'Item')}</div>
              <div className="font-bold text-gray-800 mb-3">{bookedVehicle?.name}</div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{t('status', 'Status')}</div>
              <div className="flex items-center gap-2 text-green-600 font-bold">
                <div className="w-2 h-2 rounded-full bg-green-600"></div> {t('confirmed', 'Confirmed')}
              </div>
            </div>

            <button onClick={() => setShowSuccess(false)}
              className="w-full bg-green-600 text-white font-bold py-4 rounded-2xl hover:bg-green-700 transition-all shadow-lg shadow-green-500/20">
              {t('done_btn', 'Awesome!')}
            </button>
          </motion.div>
        </div>
      )}
    </Layout>
  );
}
