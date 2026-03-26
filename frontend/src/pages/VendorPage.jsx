import { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';
import { Package, TrendingUp, ArrowRight, Plus, Loader } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLocation as useLocationRouter } from 'react-router-dom';

import { useLocation } from '../hooks/useLocation';

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5001';


export default function VendorPage() {
  const { t } = useTranslation();
  const { coords } = useLocation();
  const locationRouter = useLocationRouter();
  const voiceParams = locationRouter.state?.voiceParams;

  const { token, role } = useSelector((s) => s.auth);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showListForm, setShowListForm] = useState(voiceParams ? true : false);
  const [form, setForm] = useState({ 
    cropName: voiceParams?.cropName || '', 
    quantity: voiceParams?.quantity || '', 
    pricePerKg: voiceParams?.pricePerKg || '', 
    minNegotiable: voiceParams?.minNegotiable || '', 
    location: voiceParams?.location || '' 
  });

  useEffect(() => {
    if (voiceParams) {
      setForm(f => ({ ...f, ...voiceParams }));
      setShowListForm(true);
    }
  }, [voiceParams]);

  const [trends, setTrends] = useState([]);
  const [agreedPrices, setAgreedPrices] = useState([]);
  const [voteForm, setVoteForm] = useState({ crop: 'Rice', price: '' });

  const fetchAgreedPrices = () => {
    axios.get(`${API}/api/vendors/agreed-price`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => setAgreedPrices(Array.isArray(r.data) ? r.data : []))
      .catch(() => setAgreedPrices([]));
  };

  useEffect(() => {
    axios.get(`${API}/api/vendors/price-trends`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => setTrends(r.data))
      .catch(() => setTrends([]));
    fetchAgreedPrices();
  }, []);

  const castVote = async () => {
    if (!voteForm.price) return toast.error('Enter a price to vote');
    try {
      await axios.post(`${API}/api/vendors/price-vote`, { 
        crop: voteForm.crop, 
        votedPrice: parseFloat(voteForm.price),
        district: coords?.district || 'Unknown'
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      toast.success(`Vote cast for ${voteForm.crop} at ₹${voteForm.price}!`);
      setVoteForm({ ...voteForm, price: '' });
      fetchAgreedPrices();
    } catch {
      toast.error('Failed to cast vote');
    }
  };

  useEffect(() => {
    setLoading(true);
    const url = coords && coords.lat && coords.lng
      ? `${API}/api/vendors?lat=${coords.lat}&lng=${coords.lng}`
      : `${API}/api/vendors`;
      
    axios.get(url, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => setListings(Array.isArray(r.data) ? r.data : []))
      .catch(() => setListings([]))
      .finally(() => setLoading(false));
  }, [coords, token]);

  const [showSuccess, setShowSuccess] = useState(false);
  const [successData, setSuccessData] = useState(null);

  const makeBid = async (listing) => {
    const price = parseFloat(bidPrice);
    if (!price || isNaN(price)) return toast.error('Please enter a valid price');

    try {
      await axios.post(`${API}/api/vendors/offer`, { 
        listingId: listing._id, 
        offeredPrice: price 
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      setSuccessData({ title: 'Bid Placed!', sub: 'The farmer has been notified of your offer.', item: listing.crop || listing.cropName });
      setShowSuccess(true);
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
      const payload = { 
        ...form, 
        location: coords ? { type: 'Point', coordinates: [coords.lng, coords.lat] } : undefined 
      };
      await axios.post(`${API}/api/vendors/list`, payload, { headers: { Authorization: `Bearer ${token}` } });
      setSuccessData({ title: 'Listing Live!', sub: 'Your crop is now visible to buyers.', item: form.cropName });
      setShowSuccess(true);
      toast.success(t('listed_success'));
      setListings(l => [{ _id: Date.now().toString(), ...form, seller: 'You' }, ...l]);
      setShowListForm(false);
    } catch {
      toast.error(t('listing_failed'));
    }
  };

  const [biddingId, setBiddingId] = useState(null);
  const [bidPrice, setBidPrice] = useState('');

  return (
    <Layout title={t('vendor_title')} subtitle={t('vendor_sub')}>
      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-[32px] p-8 max-w-sm w-full text-center shadow-2xl">
            <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6 text-amber-600">
              <Package size={40} />
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-2">{successData?.title || 'Action Confirmed!'}</h2>
            <p className="text-gray-500 mb-6">{successData?.sub || 'Check your email for status updates.'}</p>
            
            <div className="bg-gray-50 rounded-2xl p-4 mb-6 text-left border border-gray-100">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Market Item</div>
              <div className="font-bold text-gray-800 mb-3 capitalize">{successData?.item}</div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Status</div>
              <div className="flex items-center gap-2 text-amber-600 font-bold">
                <div className="w-2 h-2 rounded-full bg-amber-600 text-xs"></div> {t('confirmed', 'Live / Active')}
              </div>
            </div>

            <button onClick={() => setShowSuccess(false)}
              className="w-full bg-amber-600 text-white font-bold py-4 rounded-2xl hover:bg-amber-700 transition-all shadow-lg shadow-amber-500/20">
              {t('done_btn', 'Great!')}
            </button>
          </motion.div>
        </div>
      )}

      <div className="flex items-center justify-between mb-8">
        <div className="text-sm text-gray-500 font-medium">{t('active_listings', { count: listings.length })}</div>
        <button onClick={() => setShowListForm(!showListForm)} className="flex items-center gap-2 bg-green-600 text-white font-bold px-6 py-3 rounded-2xl hover:bg-green-700 transition-colors text-sm shadow-lg shadow-green-500/20">
          <Plus size={16} /> {t('list_crop_btn')}
        </button>
      </div>
      {/* Community Price Voting Section */}
      {role === 'FARMER' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-[32px] p-8 text-white mb-8 shadow-xl shadow-green-500/20">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex-1">
              <h3 className="text-xl font-black mb-2 flex items-center gap-2">
                <TrendingUp size={24} /> Community Price Discovery
              </h3>
              <p className="text-green-50 text-sm opacity-90">Vote for the daily agreed price to protect fellow farmers from exploitation. Consensus builds power!</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 bg-white/10 p-4 rounded-[24px] backdrop-blur-md border border-white/10">
              <select 
                value={voteForm.crop} 
                onChange={e => setVoteForm({...voteForm, crop: e.target.value})}
                className="bg-white/20 border-none rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-white/50 text-white placeholder-green-100"
              >
                <option value="Rice" className="text-gray-900">Rice</option>
                <option value="Wheat" className="text-gray-900">Wheat</option>
                <option value="Tomato" className="text-gray-900">Tomato</option>
                <option value="Potato" className="text-gray-900">Potato</option>
              </select>
              <div className="flex items-center gap-2 bg-white/20 rounded-xl px-4 py-2.5">
                <span className="text-sm font-bold text-green-100">₹</span>
                <input 
                  type="number" 
                  placeholder="Price/kg"
                  value={voteForm.price}
                  onChange={e => setVoteForm({...voteForm, price: e.target.value})}
                  className="bg-transparent border-none p-0 text-sm font-bold focus:ring-0 placeholder-green-100 w-20"
                />
              </div>
              <button 
                onClick={castVote}
                className="bg-white text-green-700 font-black px-6 py-2.5 rounded-xl hover:bg-green-50 transition-all text-sm whitespace-nowrap"
              >
                Cast Vote
              </button>
            </div>
          </div>

          {agreedPrices.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-8 border-t border-white/10">
              {agreedPrices.map(ap => (
                <div key={ap._id} className="bg-white/5 p-4 rounded-2xl">
                  <div className="text-[10px] font-black uppercase text-green-100/60 mb-1">{ap._id}</div>
                  <div className="text-lg font-black tracking-tight">₹{Math.round(ap.avgPrice)}<span className="text-[10px] lowercase text-green-100/60 ml-1">avg</span></div>
                  <div className="text-[10px] mt-1 text-green-100/40 font-bold">{ap.voteCount} votes cast</div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Agri-Pulse Price Trends */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-[32px] p-8 shadow-xl shadow-gray-100/50 border border-gray-100 mb-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-xl font-black text-gray-900 leading-tight">Agri-Pulse: Market Price Trends</h3>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">7-Day Trajectory (₹ per Quintal)</p>
          </div>
          <div className="hidden md:flex gap-4">
            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500"><div className="w-2 h-2 rounded-full bg-green-500"></div> Wheat</div>
            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Rice</div>
            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500"><div className="w-2 h-2 rounded-full bg-orange-500"></div> Tomato</div>
          </div>
        </div>
        <div className="h-[300px] w-full min-h-[300px]">
          <ResponsiveContainer width="100%" height={300} minWidth={0}>
            <LineChart data={trends} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9CA3AF', fontWeight: 'bold' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9CA3AF', fontWeight: 'bold' }} />
              <Tooltip 
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', padding: '12px' }}
                itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
              />
              <Line type="monotone" dataKey="wheat" stroke="#10B981" strokeWidth={4} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="rice" stroke="#3B82F6" strokeWidth={4} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="tomato" stroke="#F97316" strokeWidth={4} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

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
