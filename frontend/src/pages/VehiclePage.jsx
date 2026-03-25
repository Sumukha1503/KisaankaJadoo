import { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';
import { MapPin, Truck, ArrowRight, Loader, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export default function VehiclePage() {
  const { t } = useTranslation();
  const { token } = useSelector((s) => s.auth);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('type_all');

  useEffect(() => {
    axios.get(`${API}/api/vehicles`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => setVehicles(r.data))
      .catch(() => setVehicles([]))
      .finally(() => setLoading(false));
  }, []);

  const types = ['type_all', 'type_tractor', 'type_harvester', 'type_tanker', 'type_equipment'];
  const filtered = filter === 'type_all' ? vehicles : vehicles.filter(v => `type_${v.type?.toLowerCase()}` === filter);

  const book = async (v) => {
    try {
      await axios.post(`${API}/api/vehicles/book`, { vehicleId: v._id, rentalDays: 1 }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success(t('vehicle_booked', { name: v.name }));
    } catch {
      toast.success(t('booking_sent', { name: v.name }));
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
    </Layout>
  );
}
