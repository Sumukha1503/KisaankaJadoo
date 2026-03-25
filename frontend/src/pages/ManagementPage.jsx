import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';
import { Plus, Package, Truck, Users, TrendingUp, ArrowRight, Loader, Edit2, Trash2, Shield } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5001';

function AddItemModal({ role, onClose, onSave, config }) {
  const [form, setForm] = useState({});
  const { t } = useTranslation();

  const handleSave = () => {
    onSave(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-[32px] p-8 w-full max-w-md shadow-2xl">
        <h3 className="text-2xl font-black mb-6">{config.btnLabel}</h3>
        <div className="space-y-4 mb-8">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Name / Title</label>
            <input type="text" onChange={e => setForm({...form, name: e.target.value})} className="w-full px-5 py-3 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-green-500" placeholder="Enter name..." />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Description</label>
            <textarea onChange={e => setForm({...form, desc: e.target.value})} className="w-full px-5 py-3 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-green-500" placeholder="Enter details..." />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Price / Rate (₹)</label>
            <input type="number" onChange={e => setForm({...form, price: e.target.value})} className="w-full px-5 py-3 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-green-500" placeholder="0" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Product/Vehicle Image</label>
            <input type="file" accept="image/*" onChange={e => {
              const file = e.target.files[0];
              if (file) {
                const reader = new FileReader();
                reader.onloadend = () => setForm({...form, image: reader.result, imageUrl: reader.result});
                reader.readAsDataURL(file);
              }
            }} className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100" />
            {form.image && <img src={form.image} className="mt-2 w-20 h-20 object-cover rounded-xl border" />}
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-4 rounded-2xl font-bold text-gray-500 hover:bg-gray-50 transition-colors">Cancel</button>
          <button onClick={handleSave} className={`flex-1 py-4 rounded-2xl font-bold text-white shadow-lg ${config.color}`}>Save Item</button>
        </div>
      </motion.div>
    </div>
  );
}

export default function ManagementPage() {
  const { t } = useTranslation();
  const { role, token } = useSelector((s) => s.auth);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [activeCategory, setActiveCategory] = useState(role);

  const configs = {
    'VEHICLE_OWNER': { title: t('manage_vehicles'), btnLabel: t('add_vehicle_btn'), endpoint: '/api/vehicles/my', postEndpoint: '/api/vehicles', icon: Truck, color: 'bg-blue-500 text-blue-500' },
    'STORE_OWNER': { title: t('manage_products'), btnLabel: t('add_product_btn'), endpoint: '/api/shop/products/my', postEndpoint: '/api/shop/products', icon: Package, color: 'bg-green-600 text-green-600' },
    'VENDOR': { title: t('manage_offers'), btnLabel: t('new_market_bid'), endpoint: '/api/vendors/my-offers', postEndpoint: '/api/vendors/my-offers', icon: TrendingUp, color: 'bg-amber-500 text-amber-500' },
    'LABOUR': { title: t('manage_availability'), btnLabel: t('update_status'), endpoint: '/api/labour/my', postEndpoint: '/api/labour/my', icon: Users, color: 'bg-purple-600 text-purple-600' },
    'FARMER': { title: t('my_tasks'), btnLabel: t('post_task_btn'), endpoint: '/api/labour/tasks/my', postEndpoint: '/api/labour/task', icon: Users, color: 'bg-green-500 text-green-500' },
    'ADMIN': { title: 'Platform Management', btnLabel: 'Global Action', endpoint: '/api/analytics/dashboard', postEndpoint: '#', icon: Shield, color: 'bg-red-600 text-red-600' }
  };

  const config = configs[activeCategory] || configs['FARMER'];

  const fetchItems = () => {
    if (!config || (activeCategory === 'ADMIN' && role === 'ADMIN')) { setLoading(false); return; }
    axios.get(`${API}${config.endpoint}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => setItems(r.data))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchItems(); }, [activeCategory]);

  const handleSave = async (form) => {
    try {
      await axios.post(`${API}${config.postEndpoint}`, form, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Item added successfully! ✨');
      fetchItems();
    } catch (err) {
      toast.error('Failed to save item');
    }
  };

  if (!config) return <Layout>Invalid Role Access</Layout>;

  return (
    <Layout title={config.title} subtitle={t('manage_sub')}>
      {showAdd && <AddItemModal role={role} config={config} onClose={() => setShowAdd(false)} onSave={handleSave} />}
      
      {/* Category Switcher for ADMIN */}
      {role === 'ADMIN' && (
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 no-scrollbar">
          {Object.keys(configs).map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border whitespace-nowrap ${activeCategory === cat ? 'bg-gray-900 text-white border-gray-900 shadow-lg' : 'bg-white text-gray-500 border-gray-100 hover:border-gray-300'}`}>
              {cat.replace('_', ' ')}
            </button>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
           <div className={`p-4 rounded-2xl ${config.color.split(' ')[0]} text-white shadow-lg`}>
              <config.icon size={24} />
           </div>
           <div>
              <h2 className="text-xl font-black text-gray-900">{activeCategory === 'ADMIN' ? 'Analytics Overview' : t('overview')}</h2>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">{items.length} {t('active_items')}</p>
           </div>
        </div>
        {activeCategory !== 'ADMIN' && (
          <button onClick={() => setShowAdd(true)} className={`flex items-center gap-2 ${config.color.split(' ')[0]} text-white font-black px-6 py-3 rounded-2xl shadow-lg hover:bg-opacity-90 transition-all text-sm`}>
            <Plus size={16} /> {config.btnLabel}
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-gray-400"><Loader size={24} className="animate-spin mr-3" /> {t('loading_mgmt')}</div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-[32px] p-16 text-center border border-gray-100 shadow-xl shadow-gray-100/50">
           <div className="text-5xl mb-4">✨</div>
           <h3 className="text-xl font-black text-gray-800 mb-2">{t('no_items_yet')}</h3>
           <p className="text-gray-400 mb-8 max-w-xs mx-auto text-sm">{t('start_by_adding')}</p>
           {activeCategory !== 'ADMIN' && <button onClick={() => setShowAdd(true)} className={`${config.color.split(' ')[1]} font-black hover:underline flex items-center justify-center gap-1 mx-auto`}>{config.btnLabel} <ArrowRight size={16}/></button>}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
           {items.map((item, i) => (
             <motion.div key={item._id || i} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
               className="bg-white rounded-[32px] p-6 shadow-clay-card border border-gray-100 hover:border-green-300 transition-all flex flex-col"
             >
                <div className="flex justify-between items-start mb-4">
                   <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center overflow-hidden">
                      {item.imageUrl || item.image ? (
                        <img src={item.imageUrl || item.image} className="w-full h-full object-cover" />
                      ) : (
                        <config.icon size={20} className="text-gray-400" />
                      )}
                   </div>
                   <div className="flex gap-2">
                      <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-400"><Edit2 size={14}/></button>
                      <button className="p-2 rounded-lg hover:bg-red-50 text-red-400"><Trash2 size={14}/></button>
                   </div>
                </div>
                <h4 className="font-black text-gray-900 mb-1">{item.name || item.title || item.crop}</h4>
                <p className="text-gray-500 text-xs mb-4 flex-grow">{item.desc || item.description || t('status_active')}</p>
                <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                   <span className={`${config.color.split(' ')[1]} font-black text-sm`}>₹{(item.price || item.rate || item.offeredPrice || 0).toLocaleString('en-IN')}</span>
                   <span className="px-3 py-1 bg-green-50 text-green-700 text-[10px] font-black rounded-full uppercase">{item.status || t('status_live')}</span>
                </div>
             </motion.div>
           ))}
        </div>
      )}
    </Layout>
  );
}
