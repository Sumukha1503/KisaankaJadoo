import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';
import { Plus, Package, Truck, Users, TrendingUp, ArrowRight, Loader, Edit2, Trash2, Shield } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLocation } from '../hooks/useLocation';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5001';

function AddItemModal({ role, onClose, onSave, config, voiceParams, initialData }) {
  const [form, setForm] = useState(initialData || {});
  const { t } = useTranslation();

  useEffect(() => {
    if (initialData) setForm(initialData);
    if (voiceParams) setForm(prev => ({ ...prev, ...voiceParams }));
  }, [initialData, voiceParams]);

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
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Name / Model / Category</label>
            <input type="text" value={form.name || form.title || form.crop || form.taskType || form.model || form.cropName || ''} onChange={e => setForm({...form, name: e.target.value, title: e.target.value, crop: e.target.value, taskType: e.target.value, model: e.target.value, cropName: e.target.value})} className="w-full px-5 py-3 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-green-500" placeholder="Enter name..." />
          </div>
          {(role === 'VEHICLE_OWNER' || role === 'STORE_OWNER' || role === 'VENDOR') && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">District / Area</label>
                <input type="text" value={form.district || ''} onChange={e => setForm({...form, district: e.target.value})} className="w-full px-5 py-3 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-green-500" placeholder="e.g. Ludhiana" required />
              </div>
              <div>
                {role === 'VENDOR' ? (
                  <>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Quantity (Quintals)</label>
                    <input type="number" value={form.stock || form.quantity || form.quantityReq || ''} onChange={e => setForm({...form, stock: e.target.value, quantity: e.target.value, quantityReq: e.target.value})} className="w-full px-5 py-3 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-green-500" placeholder="0" required />
                  </>
                ) : (
                  <>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">{role === 'VEHICLE_OWNER' ? 'Vehicle Type' : 'Category'}</label>
                    <select value={form.type || form.category || ''} onChange={e => setForm({...form, type: e.target.value, category: e.target.value})} className="w-full px-5 py-3 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-green-500 text-sm" required>
                      <option value="">Select...</option>
                      {role === 'VEHICLE_OWNER' ? (
                        <>
                          <option value="Tractor">Tractor</option>
                          <option value="Harvester">Harvester</option>
                          <option value="Delivery Van">Delivery Van</option>
                          <option value="Water Tanker">Water Tanker</option>
                        </>
                      ) : (
                        <>
                          <option value="SEEDS">Seeds</option>
                          <option value="FERTILIZERS">Fertilizers</option>
                          <option value="PESTICIDES">Pesticides</option>
                          <option value="TOOLS">Tools</option>
                          <option value="IRRIGATION">Irrigation</option>
                        </>
                      )}
                    </select>
                  </>
                )}
              </div>
            </div>
          )}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Description</label>
            <textarea value={form.desc || form.description || ''} onChange={e => setForm({...form, desc: e.target.value, description: e.target.value})} className="w-full px-5 py-3 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-green-500" placeholder="Enter details..." />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Price / Rate (₹)</label>
            <input type="number" value={(form.price ?? form.rate ?? form.unitPrice ?? form.offeredPrice ?? form.ratePerHour ?? '').toString()} onChange={e => {
              const val = e.target.value === '' ? '' : parseFloat(e.target.value);
              setForm({...form, price: val, rate: val, unitPrice: val, ratePerHour: val, offeredPrice: val});
            }} className="w-full px-5 py-3 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-green-500" placeholder="0" />
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
          <button onClick={handleSave} className={`flex-1 py-4 rounded-2xl font-bold text-white shadow-lg ${config.color.split(' ')[0]}`}>{form._id ? 'Update Item' : 'Save Item'}</button>
        </div>
      </motion.div>
    </div>
  );
}

import { useLocation as useLocationRouter } from 'react-router-dom';

export default function ManagementPage() {
  const { t } = useTranslation();
  const { coords } = useLocation();
  const locationRouter = useLocationRouter();
  const voiceParams = locationRouter.state?.voiceParams;

  const { role, token } = useSelector((s) => s.auth);
  const [items, setItems] = useState([]);
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || role;
  
  const [editingItem, setEditingItem] = useState(null);
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [orders, setOrders] = useState([]);
  const [view, setView] = useState('inventory'); // 'inventory' or 'orders'

  // Effect to handle voiceParams for initial add modal display
  useEffect(() => {
    if (voiceParams) {
      setShowAdd(true);
    }
  }, [voiceParams]);

  const configs = {
    'VEHICLE_OWNER': { title: t('manage_vehicles'), btnLabel: t('add_vehicle_btn'), endpoint: '/api/vehicles/my', postEndpoint: '/api/vehicles', deleteEndpoint: '/api/vehicles', icon: Truck, color: 'bg-blue-500 text-blue-500' },
    'STORE_OWNER': { title: t('manage_products'), btnLabel: t('add_product_btn'), endpoint: '/api/shop/products/my', postEndpoint: '/api/shop/products', deleteEndpoint: '/api/shop/products', icon: Package, color: 'bg-green-600 text-green-600' },
    'VENDOR': { title: t('manage_offers'), btnLabel: t('new_market_bid'), endpoint: '/api/vendors/my-offers', postEndpoint: '/api/vendors', deleteEndpoint: '/api/vendors', icon: TrendingUp, color: 'bg-amber-500 text-amber-500' },
    'LABOUR': { title: t('manage_availability'), btnLabel: t('update_status'), endpoint: '/api/labour/my-profile', postEndpoint: '/api/labour/my-profile', deleteEndpoint: '/api/labour/my-profile', icon: Users, color: 'bg-purple-600 text-purple-600' },
    'FARMER': { title: t('my_tasks'), btnLabel: t('post_task_btn'), endpoint: '/api/labour/tasks/my', postEndpoint: '/api/labour/task', deleteEndpoint: '/api/labour/task', icon: Users, color: 'bg-green-500 text-green-500' },
    'ADMIN': { title: 'Platform Management', btnLabel: 'Global Action', endpoint: '#', postEndpoint: '#', deleteEndpoint: '#', icon: Shield, color: 'bg-red-600 text-red-600' }
  };

  const config = configs[activeCategory] || configs['FARMER'];

  const fetchItems = () => {
    if (!config || (activeCategory === 'ADMIN' && role === 'ADMIN' && view !== 'orders')) { setLoading(false); return; }
    setLoading(true);
    axios.get(`${API}${config.endpoint}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => {
        const data = r.data;
        setItems(Array.isArray(data) ? data : (data ? [data] : []));
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));

    if (activeCategory === 'FARMER' || activeCategory === 'LABOUR') {
      axios.get(`${API}/api/labour/invites/my`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => setInvites(r.data))
        .catch(() => setInvites([]));
    }

    if (activeCategory === 'STORE_OWNER' || (activeCategory === 'ADMIN' && role === 'ADMIN')) {
      axios.get(`${API}/api/shop/orders`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => setOrders(r.data))
        .catch(() => setOrders([]));
    }
  };

  const handleUpdateInvite = async (id, status) => {
    try {
      await axios.patch(`${API}/api/labour/invite/${id}/status`, { status }, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      toast.success(`Invite ${status}!`);
      fetchItems();
    } catch {
      toast.error('Failed to update invite');
    }
  };

  useEffect(() => { fetchItems(); }, [activeCategory]);

  const handleSave = async (form) => {
    try {
      const payload = { 
        ...form, 
        location: coords ? { type: 'Point', coordinates: [coords.lng, coords.lat] } : undefined 
      };
      
      if (form._id) {
        // Update
        const url = activeCategory === 'LABOUR' 
          ? `${API}${config.postEndpoint}` // Profile update doesn't need ID in URL
          : `${API}${config.postEndpoint}/${form._id}`;
          
        await axios.patch(url, payload, { 
          headers: { Authorization: `Bearer ${token}` } 
        });
        toast.success('Item updated successfully! ✨');
      } else {
        // Create
        await axios.post(`${API}${config.postEndpoint}`, payload, { 
          headers: { Authorization: `Bearer ${token}` } 
        });
        toast.success('Item added successfully! ✨');
      }
      
      setEditingItem(null);
      fetchItems();
    } catch (err) {
      toast.error(form._id ? 'Failed to update item' : 'Failed to save item');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('confirm_delete') || 'Are you sure you want to delete this?')) return;
    try {
      await axios.delete(`${API}${config.deleteEndpoint}/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Deleted successfully 🗑️');
      fetchItems();
    } catch {
      toast.error('Failed to delete item');
    }
  };

  const handleVerify = async (id, type) => {
    try {
      const endpoints = {
        'labour': `/api/labour/verify/${id}`,
        'vehicle': `/api/vehicles/verify/${id}`,
        'STORE_OWNER': `/api/shop/verify/${id}`,
        'VENDOR': `/api/vendor/verify/${id}`
      };
      await axios.patch(`${API}${endpoints[type]}`, {}, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      toast.success('Verified successfully! ✅');
      fetchItems();
    } catch {
      toast.error('Verification failed');
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await axios.patch(`${API}/api/shop/orders/${id}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(`Order status updated to ${status}! 📦`);
      fetchItems();
    } catch {
      toast.error('Failed to update order status');
    }
  };


  if (!config) return <Layout>Invalid Role Access</Layout>;

  return (
    <Layout title={config.title} subtitle={t('manage_sub')}>
      {showAdd && (
        <AddItemModal 
          role={role} 
          config={config} 
          initialData={editingItem}
          onClose={() => { setShowAdd(false); setEditingItem(null); }} 
          onSave={handleSave} 
          voiceParams={voiceParams} 
        />
      )}
      
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

      {/* Invitations Section (Received by Farmer or Sent by Labour) */}
      {(activeCategory === 'FARMER' || activeCategory === 'LABOUR') && invites.length > 0 && (
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-6 text-gray-900 font-black text-lg">
            <Shield size={20} className="text-green-500" />
            {activeCategory === 'FARMER' ? 'Labourer Applications' : 'My Sent Applications'}
          </div>
          <div className="grid gap-4">
            {invites.map((inv) => (
              <div key={inv._id} className="bg-white rounded-[24px] p-5 border border-emerald-100 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold">
                    {activeCategory === 'FARMER' ? inv.labourId?.name?.[0] : inv.farmerId?.name?.[0]}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">
                      {activeCategory === 'FARMER' ? inv.labourId?.name : inv.farmerId?.name} 
                      <span className="text-xs font-medium text-gray-400 ml-2 italic">Applied for {inv.taskId?.taskType || 'Task'}</span>
                    </h4>
                    <p className="text-xs text-gray-500 font-medium">{activeCategory === 'FARMER' ? inv.labourId?.phone : inv.farmerId?.phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                    inv.status === 'accepted' ? 'bg-green-100 text-green-700' : 
                    inv.status === 'rejected' ? 'bg-red-100 text-red-700' : 
                    'bg-amber-100 text-amber-700'
                  }`}>
                    {inv.status}
                  </span>
                  {activeCategory === 'FARMER' && inv.status === 'pending' && (
                    <div className="flex gap-1 ml-4">
                      <button onClick={() => handleUpdateInvite(inv._id, 'accepted')} className="bg-green-600 text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-green-700 transition-all">Accept</button>
                      <button onClick={() => handleUpdateInvite(inv._id, 'rejected')} className="bg-gray-100 text-gray-600 text-xs font-bold px-4 py-2 rounded-xl hover:bg-gray-200 transition-all">Reject</button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
           <div className={`p-4 rounded-2xl ${config.color.split(' ')[0]} text-white shadow-lg`}>
              <config.icon size={24} />
           </div>
           <div>
              <h2 className="text-xl font-black text-gray-900">{activeCategory === 'ADMIN' ? 'Analytics Overview' : t('overview')}</h2>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">{view === 'inventory' ? items.length : orders.length} {view === 'inventory' ? t('active_items') : 'Incoming Orders'}</p>
           </div>
        </div>
        <div className="flex items-center gap-3">
          {activeCategory === 'STORE_OWNER' && (
            <div className="flex bg-gray-100 p-1 rounded-2xl mr-4">
              <button onClick={() => setView('inventory')} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${view === 'inventory' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Inventory</button>
              <button onClick={() => setView('orders')} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${view === 'orders' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Orders</button>
            </div>
          )}
          {activeCategory !== 'ADMIN' && view === 'inventory' && (
            <button onClick={() => setShowAdd(true)} className={`flex items-center gap-2 ${config.color.split(' ')[0]} text-white font-black px-6 py-3 rounded-2xl shadow-lg hover:bg-opacity-90 transition-all text-sm`}>
              <Plus size={16} /> {config.btnLabel}
            </button>
          )}
        </div>
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
           {view === 'inventory' ? items.map((item, i) => (
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
                        <button 
                          onClick={() => { setEditingItem(item); setShowAdd(true); }}
                          className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 group relative"
                        >
                          <Edit2 size={14}/>
                          <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Edit</span>
                        </button>
                       <button 
                         onClick={() => handleDelete(item._id)}
                         className="p-2 rounded-lg hover:bg-red-50 text-red-400 group relative"
                       >
                         <Trash2 size={14}/>
                         <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Delete</span>
                       </button>
                        {role === 'ADMIN' && !item.verified && !item.isVerified && (
                          <button 
                            onClick={() => handleVerify(item._id, activeCategory === 'LABOUR' ? 'labour' : (activeCategory === 'VEHICLE_OWNER' ? 'vehicle' : activeCategory))}
                            className="bg-green-600 text-white text-[10px] font-black px-3 py-1.5 rounded-lg hover:bg-green-700 transition-all shadow-sm"
                          >
                            Verify
                          </button>
                        )}
                    </div>
                </div>
                <h4 className="font-black text-gray-900 mb-1">{item.name || item.title || item.crop}</h4>
                <div className="flex flex-wrap gap-1 mb-2">
                   {(item.skills || []).map((s, idx) => (
                     <span key={idx} className="bg-purple-50 text-purple-600 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">{s}</span>
                   ))}
                </div>
                <p className="text-gray-500 text-xs mb-2 flex-grow">{item.desc || item.description || t('active_status')}</p>
                
                {!item.available && item.lastBooking && (
                  <div className="mb-4 p-3 bg-blue-50 rounded-2xl border border-blue-100">
                    <div className="text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-1">Rented By</div>
                    <div className="text-sm font-black text-blue-700">{item.lastBooking.farmerId?.name}</div>
                    <div className="text-[10px] text-blue-500 font-medium">Ph: {item.lastBooking.farmerId?.phone}</div>
                  </div>
                )}
                 <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                   <span className={`${config.color.split(' ')[1]} font-black text-sm`}>
                     ₹{(item.myOffer?.offeredPrice || item.price || item.rate || item.offeredPrice || item.ratePerHour || item.unitPrice || item.wage || 0).toLocaleString('en-IN')}
                   </span>
                   <span className={`px-3 py-1 text-[10px] font-black rounded-full uppercase ${!item.available && activeCategory === 'VEHICLE_OWNER' ? 'bg-blue-100 text-blue-700' : 'bg-green-50 text-green-700'}`}>
                     {!item.available && activeCategory === 'VEHICLE_OWNER' ? 'Rented' : (item.status || t('live_status'))}
                   </span>
                 </div>
             </motion.div>
           )) : orders.map((order, i) => (
             <motion.div key={order._id || i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
               className="bg-white rounded-[32px] p-6 shadow-clay-card border border-gray-100"
             >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Order ID</div>
                    <div className="text-sm font-black text-gray-900">#{order.trackingId}</div>
                  </div>
                  <div className={`px-3 py-1 text-[10px] font-black rounded-full uppercase ${
                    order.status === 'Delivered' ? 'bg-green-100 text-green-700' : 
                    order.status === 'Shipped' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {order.status}
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="text-[10px] font-bold text-gray-400 uppercase mb-2">Customer Info</div>
                  <div className="text-sm font-black text-gray-800">{order.farmerId?.name || 'Customer'}</div>
                  <div className="text-xs text-gray-500 font-medium">{order.shippingAddress}</div>
                </div>

                <div className="space-y-4 mb-6">
                   {order.items.map((it, idx) => (
                     <div key={idx} className="flex justify-between text-xs">
                        <span className="text-gray-500 font-bold">{it.productId?.name} x {it.quantity}</span>
                        <span className="font-black">₹{it.price * it.quantity}</span>
                     </div>
                   ))}
                   <div className="pt-4 border-t border-gray-50 flex justify-between">
                      <span className="font-black text-gray-900">Total</span>
                      <span className="font-black text-green-600">₹{order.totalAmount}</span>
                   </div>
                </div>

                {order.status !== 'Delivered' && (
                  <div className="flex gap-2">
                    {order.status === 'Processing' && (
                      <button onClick={() => handleStatusUpdate(order._id, 'Shipped')} className="flex-1 bg-blue-600 text-white text-[10px] font-black py-2.5 rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-200">Ship Order</button>
                    )}
                    {order.status === 'Shipped' && (
                      <button onClick={() => handleStatusUpdate(order._id, 'Delivered')} className="flex-1 bg-green-600 text-white text-[10px] font-black py-2.5 rounded-xl hover:bg-green-700 transition-all shadow-md shadow-green-200">Mark Delivered</button>
                    )}
                  </div>
                )}
             </motion.div>
           ))}
        </div>
      )}
    </Layout>
  );
}
