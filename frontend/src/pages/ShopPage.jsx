import { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';
import { ShoppingCart, Search, Plus, Minus, X, Loader, Mic } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useVoice } from '../hooks/useVoice';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export default function ShopPage() {
  const { t } = useTranslation();
  const { token } = useSelector((s) => s.auth);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [cartOpen, setCartOpen] = useState(false);
  const { isListening, startListening } = useVoice();

  useEffect(() => {
    axios.get(`${API}/api/shop/products`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => setProducts(r.data))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

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

  const checkout = () => {
    if (!cart.length) return;
    toast.success(t('checkout_initiated'));
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
    </Layout>
  );
}
