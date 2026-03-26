import { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { Link, useLocation as useLocationRouter, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';
import { ShoppingCart, Search, Plus, Minus, X, Loader, Mic, Package, Scan, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useVoice } from '../hooks/useVoice';

import { useLocation } from '../hooks/useLocation';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export default function ShopPage() {
  const { t } = useTranslation();
  const { coords } = useLocation();
  const { token } = useSelector((s) => s.auth);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [cartOpen, setCartOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);
  const [myOrders, setMyOrders] = useState([]);
  const [showOrders, setShowOrders] = useState(false);
  const { isListening, startListening } = useVoice();

  useEffect(() => {
    if (!coords) return;
    setLoading(true);
    axios.get(`${API}/api/shop/products?lat=${coords.lat}&lng=${coords.lng}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => setProducts(Array.isArray(r.data) ? r.data : []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [coords]);

  const addToCart = (p) => {
    setCart(c => {
      const existing = c.find(i => i._id === p._id);
      if (existing) return c.map(i => i._id === p._id ? { ...i, qty: i.qty + 1 } : i);
      return [...c, { ...p, qty: 1 }];
    });
    toast.success(t('added_to_cart', { name: p.name }));
  };

  const removeFromCart = (id) => setCart(c => c.filter(i => i._id !== id));
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  const checkout = async () => {
    if (!cart.length) return;
    try {
      // For MVP, we use the first item's storeOwnerId as the order's storeOwnerId
      const storeOwnerId = cart[0].storeOwnerId?._id || cart[0].storeOwnerId;
      
      const payload = {
        items: cart.map(i => ({ productId: i._id, name: i.name, quantity: i.qty, price: i.price })),
        totalAmount: total,
        paymentMethod: 'COD',
        shippingAddress: {
          address: 'Default Farmer Address',
          district: coords?.district || 'Nearby District',
          pinCode: '000000'
        },
        storeOwnerId
      };

      const res = await axios.post(`${API}/api/shop/orders`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setPlacedOrder(res.data);
      setShowSuccess(true);
      setCart([]);
      setCartOpen(false);
      toast.success(t('order_placed_success', 'Order placed successfully!'));

      // Auto-open orders after celebration
      setTimeout(() => {
        setShowSuccess(false);
        fetchOrders();
      }, 4000);
    } catch (err) {
      console.error('Checkout failed:', err);
      toast.error(t('checkout_failed', 'Failed to place order'));
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${API}/api/shop/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMyOrders(res.data);
      setShowOrders(true);
    } catch {
      toast.error('Failed to fetch orders');
    }
  };

  const filtered = products.filter(p => p.name?.toLowerCase().includes(search.toLowerCase()));

  const displayProducts = filtered;

  const { role } = useSelector((s) => s.auth);
  const navigate = useNavigate();

  return (
    <Layout title={t('shop_title')} subtitle={t('shop_sub')}>
      <div className="flex flex-col md:flex-row items-center gap-4 mb-8">
        <div className="flex-1 relative w-full">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t('search_products')} className="w-full pl-12 pr-12 py-3.5 rounded-2xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-green-500/40 focus:border-green-500 transition-all" />
          <button 
            onClick={() => startListening((text) => setSearch(text))}
            className={`absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-all ${isListening ? 'bg-red-100 text-red-600 animate-pulse' : 'text-gray-400 hover:text-green-600'}`}
          >
            <Mic size={18} />
          </button>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          {(role === 'STORE_OWNER' || role === 'ADMIN') && (
            <button onClick={() => navigate('/manage')} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-blue-600 text-white font-bold px-6 py-3.5 rounded-2xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20 text-sm">
              <Plus size={18} /> {t('add_product_btn', 'Add Product')}
            </button>
          )}
          <button onClick={() => setCartOpen(true)} className="flex-1 md:flex-none relative flex items-center justify-center gap-2 bg-gray-900 text-white font-bold px-6 py-3.5 rounded-2xl hover:bg-gray-800 transition-colors text-sm">
            <ShoppingCart size={18} />
            {t('cart_btn')}
            {cartCount > 0 && <span className="absolute -top-2 -right-2 w-6 h-6 bg-green-600 text-white text-xs rounded-full flex items-center justify-center font-bold">{cartCount}</span>}
          </button>
          <button onClick={fetchOrders} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white text-gray-700 border border-gray-200 font-bold px-6 py-3.5 rounded-2xl hover:bg-gray-50 transition-colors text-sm shadow-sm">
            {t('my_orders', 'My Orders')}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-gray-400"><Loader size={24} className="animate-spin mr-3" />{t('loading_products')}</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayProducts.map((p, i) => (
            <motion.div key={p._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              className="bg-white rounded-[28px] overflow-hidden shadow-xl shadow-gray-100/50 border border-gray-100 hover:-translate-y-1 transition-transform">
              <div className="h-48 bg-gray-100 overflow-hidden">
                <img src={p.imageUrl || p.image} alt={p.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-6">
                <div className="inline-block bg-green-50 text-green-700 text-xs font-bold px-3 py-1 rounded-full mb-3">{p.category}</div>
                <h3 className="font-black text-gray-900 mb-1">{p.name}</h3>
                <p className="text-xs text-gray-400 mb-4">{t('in_stock', { count: p.stock })}</p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-black text-gray-900">₹{p.price?.toLocaleString('en-IN')}</span>
                  <button onClick={() => addToCart(p)} className="flex items-center gap-2 bg-green-600 text-white font-bold px-5 py-2.5 rounded-2xl hover:bg-green-700 transition-colors text-sm shadow-lg shadow-green-500/20">
                    <Plus size={14} /> {t('add_btn')}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Cart Drawer */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setCartOpen(false)} />
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="relative w-full max-w-md bg-white h-full flex flex-col shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-black text-gray-900">{t('your_cart')} ({cartCount})</h2>
              <button onClick={() => setCartOpen(false)} className="p-2 rounded-xl hover:bg-gray-100"><X size={20} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {cart.length === 0 ? (
                <div className="text-center text-gray-400 py-20">{t('cart_empty')}</div>
              ) : cart.map(item => (
                <div key={item._id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                  <div className="w-14 h-14 rounded-xl bg-gray-200 overflow-hidden"><img src={item.imageUrl || item.image} className="w-full h-full object-cover" /></div>
                  <div className="flex-1">
                    <div className="font-bold text-gray-900 text-sm">{item.name}</div>
                    <div className="text-green-700 font-black">₹{(item.price * item.qty).toLocaleString('en-IN')}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => item.qty === 1 ? removeFromCart(item._id) : setCart(c => c.map(i => i._id === item._id ? { ...i, qty: i.qty - 1 } : i))} className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center hover:bg-red-100 transition-colors"><Minus size={12} /></button>
                    <span className="text-sm font-bold w-4 text-center">{item.qty}</span>
                    <button onClick={() => setCart(c => c.map(i => i._id === item._id ? { ...i, qty: i.qty + 1 } : i))} className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center hover:bg-green-100 transition-colors"><Plus size={12} /></button>
                  </div>
                </div>
              ))}
            </div>
            {cart.length > 0 && (
              <div className="p-6 border-t border-gray-100">
                <div className="flex justify-between font-black text-lg mb-4"><span>{t('total_label')}</span><span>₹{total.toLocaleString('en-IN')}</span></div>
                <button onClick={checkout} className="w-full bg-green-600 text-white font-bold py-4 rounded-2xl hover:bg-green-700 transition-colors shadow-lg shadow-green-500/20">
                  {t('checkout_btn')}
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
      {/* Success Modal with Animation */}
      <AnimatePresence>
        {showSuccess && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            {/* Confetti Particles */}
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 0, y: 0 }}
                animate={{ 
                  opacity: [0, 1, 0],
                  x: (Math.random() - 0.5) * 600,
                  y: (Math.random() - 0.5) * 600,
                  rotate: Math.random() * 360
                }}
                transition={{ duration: 2, repeat: Infinity, delay: Math.random() * 0.5 }}
                className={`absolute w-3 h-3 rounded-sm ${['bg-green-400', 'bg-yellow-400', 'bg-blue-400', 'bg-red-400'][i % 4]}`}
              />
            ))}

            <motion.div 
              initial={{ scale: 0.8, opacity: 0, y: 30 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white/95 backdrop-blur-2xl rounded-[40px] p-10 max-w-sm w-full text-center shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)] border border-white/40"
            >
              <motion.div 
                initial={{ rotate: -15, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ type: 'spring', damping: 12, delay: 0.2 }}
                className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8 text-white shadow-xl shadow-green-200"
              >
                <motion.div 
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                >
                  <Package size={48} />
                </motion.div>
              </motion.div>

              <h2 className="text-3xl font-black text-gray-900 mb-2">Order Confirmed!</h2>
              <p className="text-gray-500 font-medium mb-8 leading-relaxed">Your farming essentials are officially on the way. Check your email for tracking details.</p>
              
              <div className="bg-gray-50/50 backdrop-blur-sm rounded-3xl p-5 mb-8 text-left border border-gray-100 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-green-600 shrink-0">
                  <Scan size={24} />
                </div>
                <div>
                  <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Tracking ID</div>
                  <div className="font-mono text-sm font-black text-green-700">{placedOrder?.trackingId}</div>
                </div>
              </div>

              <button 
                onClick={() => { setShowSuccess(false); fetchOrders(); }}
                className="w-full bg-gray-900 text-white font-bold py-5 rounded-[24px] hover:bg-black transition-all shadow-xl shadow-gray-200 flex items-center justify-center gap-3 group"
              >
                {t('done_btn', 'View My Orders')}
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Orders List Modal */}
      {showOrders && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            className="bg-white rounded-[32px] p-8 max-w-lg w-full shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-gray-900">Your Orders</h2>
              <button onClick={() => setShowOrders(false)} className="p-2 hover:bg-gray-100 rounded-xl"><X size={20}/></button>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
              {myOrders.length === 0 ? (
                <div className="text-center py-10 text-gray-400">No orders placed yet.</div>
              ) : myOrders.map(order => (
                <div key={order._id} className="p-4 rounded-2xl border border-gray-100 bg-gray-50">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-black uppercase text-gray-400">ID: {order.trackingId}</span>
                    <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-black uppercase">{order.status}</span>
                  </div>
                  <div className="font-bold text-gray-800 text-sm mb-1">{order.items.map(i => i.name).join(', ')}</div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</span>
                    <span className="font-black text-gray-900">₹{order.totalAmount.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </Layout>
  );
}
