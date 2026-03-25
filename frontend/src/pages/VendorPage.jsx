import { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';
import { Package, TrendingUp, ArrowRight, Plus, Loader } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5001';


export default function VendorPage() {
  const { t } = useTranslation();
  const { token, role } = useSelector((s) => s.auth);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showListForm, setShowListForm] = useState(false);
  const [form, setForm] = useState({ cropName: '', quantity: '', pricePerKg: '', minNegotiable: '', location: '' });

  useEffect(() => {
    axios.get(`${API}/api/vendors`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => setListings(r.data))
      .catch(() => setListings([]))
      .finally(() => setLoading(false));
  }, []);

  const [biddingId, setBiddingId] = useState(null);
  const [bidPrice, setBidPrice] = useState('');

  const makeBid = async (listing) => {
    const price = parseFloat(bidPrice);
    if (!price || isNaN(price)) return toast.error('Please enter a valid price');

    try {
      await axios.post(`${API}/api/vendors/offer`, { 
        listingId: listing._id, 
        offeredPrice: price 
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      toast.success(t('bid_placed_success', { price: price, name: listing.cropName || listing.crop }));
      setBiddingId(null);
      setBidPrice('');
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Failed to place bid');
    }
  };

  const submitListing = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/api/vendors/list`, form, { headers: { Authorization: `Bearer ${token}` } });
      toast.success(t('listed_success'));
      setListings(l => [{ _id: Date.now().toString(), ...form, seller: 'You' }, ...l]);
      setShowListForm(false);
    } catch {
      toast.error(t('listing_failed'));
    }
  };

  return (
    <Layout title={t('vendor_title')} subtitle={t('vendor_sub')}>
      <div className="flex items-center justify-between mb-8">
        <div className="text-sm text-gray-500 font-medium">{t('active_listings', { count: listings.length })}</div>
        <button onClick={() => setShowListForm(!showListForm)} className="flex items-center gap-2 bg-green-600 text-white font-bold px-6 py-3 rounded-2xl hover:bg-green-700 transition-colors text-sm shadow-lg shadow-green-500/20">
          <Plus size={16} /> {t('list_crop_btn')}
        </button>
      </div>

      {/* Listing Form */}
      {showListForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-[32px] p-8 shadow-xl shadow-gray-100/50 border border-gray-100 mb-8">
          <h3 className="text-xl font-black text-gray-900 mb-6">{t('new_listing_header')}</h3>
          <form onSubmit={submitListing} className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: 'cropName', placeholder: t('placeholder_crop'), label: t('label_crop') },
              { name: 'quantity', placeholder: t('placeholder_kg'), label: t('label_quantity_kg'), type: 'number' },
              { name: 'pricePerKg', placeholder: t('placeholder_currency_kg'), label: t('label_ask_price'), type: 'number' },
              { name: 'minNegotiable', placeholder: t('placeholder_currency_kg'), label: t('label_min_acc'), type: 'number' },
              { name: 'location', placeholder: t('placeholder_city_state'), label: t('label_location') },
            ].map(({ name, placeholder, label, type='text' }) => (
              <div key={name}>
                <label className="block text-xs font-bold text-gray-600 mb-1">{label}</label>
                <input type={type} name={name} value={form[name]} onChange={e => setForm(f => ({ ...f, [name]: e.target.value }))} placeholder={placeholder} className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500/40 text-sm" required />
              </div>
            ))}
            <div className="flex items-end gap-3">
              <button type="submit" className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white font-bold py-3 rounded-2xl hover:bg-green-700 text-sm shadow-lg shadow-green-500/20">
                <ArrowRight size={14} /> {t('publish_btn')}
              </button>
              <button type="button" onClick={() => setShowListForm(false)} className="px-4 py-3 rounded-2xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50">
                {t('cancel_btn')}
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20 text-gray-400"><Loader size={24} className="animate-spin mr-3" />{t('loading_marketplace')}</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.length === 0 ? (
            <div className="col-span-full py-20 text-center text-gray-400">{t('no_listings')}</div>
          ) : listings.map((l, i) => (
            <motion.div key={l._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              className="bg-white rounded-[28px] overflow-hidden shadow-xl shadow-gray-100/50 border border-gray-100 hover:-translate-y-1 transition-transform">
              <div className="h-44 bg-gray-100 overflow-hidden text-center flex items-center justify-center">
                 <Package size={48} className="text-gray-200" />
              </div>
              <div className="p-6">
                <div className="inline-block bg-amber-50 text-amber-700 text-xs font-bold px-3 py-1 rounded-full mb-3">
                  <Package size={11} className="inline mr-1" />{l.quantityReq || l.quantity} {t('quintals')}
                </div>
                <h3 className="font-black text-gray-900 text-lg mb-1">{l.crop || l.cropName}</h3>
                <p className="text-gray-400 text-xs mb-4">{l.seller || t('verified_farmer')} · {l.district || l.location}</p>

                <div className="flex items-center justify-between mb-5">
                  <div>
                    <div className="text-2xl font-black text-gray-900">₹{l.unitPrice || (l.pricePerKg * 100)}/q</div>
                    <div className="text-xs text-gray-400 flex items-center gap-1 mt-0.5"><TrendingUp size={10}/> {t('base_price')}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-gray-700">{t('total_value')}</div>
                    <div className="text-sm text-green-700 font-black">₹{((l.quantityReq || l.quantity) * (l.unitPrice || l.pricePerKg * 100)).toLocaleString('en-IN')}</div>
                  </div>
                </div>
                
                {biddingId === l._id ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                       <span className="text-gray-400 text-xs">₹</span>
                       <input 
                         type="number" 
                         autoFocus
                         placeholder={t('placeholder_currency_kg').replace('₹/kg', '')}
                         value={bidPrice}
                         onChange={(e) => setBidPrice(e.target.value)}
                         className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/40"
                       />
                       <span className="text-gray-400 text-xs">/kg</span>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => makeBid(l)} 
                        className="flex-1 bg-green-600 text-white font-bold py-2 rounded-xl hover:bg-green-700 transition-colors text-xs"
                      >
                        {t('publish_btn', 'Confirm')}
                      </button>
                      <button 
                        onClick={() => setBiddingId(null)} 
                        className="px-3 py-2 rounded-xl border border-gray-200 text-gray-500 text-xs hover:bg-gray-50"
                      >
                        {t('cancel_btn', 'Cancel')}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button 
                    onClick={() => { setBiddingId(l._id); setBidPrice(l.minNegotiable || (l.unitPrice / 100) || ''); }} 
                    className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white font-bold py-2.5 rounded-2xl hover:bg-gray-800 transition-colors text-sm"
                  >
                    {t('place_bid_btn')} <ArrowRight size={14} />
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </Layout>
  );
}
