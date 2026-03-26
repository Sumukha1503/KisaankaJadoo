import { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';
import { 
  Users, ShoppingBag, Truck, ClipboardList, TrendingUp, 
  Download, FileText, Calendar, ArrowRight, Loader 
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export default function AdminDashboard() {
  const { token } = useSelector((s) => s.auth);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API}/api/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(res.data);
    } catch (err) {
      toast.error('Failed to load platform statistics');
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    if (!data) return;
    const stats = [
      ['Metric', 'Value'],
      ['Total Users', data.stats.users],
      ['Shop Orders', data.stats.orders],
      ['Vehicle Bookings', data.stats.bookings],
      ['Labour Tasks', data.stats.tasks],
      ['Market Listings', data.stats.listings],
      ['Shop Revenue', `₹${data.stats.revenue.shop}`],
      ['Rental Revenue', `₹${data.stats.revenue.rentals}`]
    ];

    const csvContent = "data:text/csv;charset=utf-8," 
      + stats.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `kisaan_platform_stats_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('CSV Exported! 📊');
  };

  const exportPDF = async () => {
    const doc = new jsPDF();
    const element = document.getElementById('admin-stats-print');
    if (!element) return;

    toast.loading('Generating PDF...', { id: 'pdf-gen' });
    try {
      const canvas = await html2canvas(element);
      const imgData = canvas.toDataURL('image/png');
      const imgProps = doc.getImageProperties(imgData);
      const pdfWidth = doc.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      doc.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      doc.save(`kisaan_report_${Date.now()}.pdf`);
      toast.success('PDF Exported! 📄', { id: 'pdf-gen' });
    } catch {
      toast.error('PDF Generation Failed', { id: 'pdf-gen' });
    }
  };

  if (loading) return (
    <Layout title="Admin Dashboard">
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <Loader size={48} className="animate-spin mb-4 text-green-600" />
        <p className="font-bold">Aggregating Platform Data...</p>
      </div>
    </Layout>
  );

  const statCards = [
    { label: 'Total Users', value: data?.stats.users, icon: Users, color: 'text-blue-600 bg-blue-50' },
    { label: 'Shop Orders', value: data?.stats.orders, icon: ShoppingBag, color: 'text-green-600 bg-green-50' },
    { label: 'Rentals', value: data?.stats.bookings, icon: Truck, color: 'text-amber-600 bg-amber-50' },
    { label: 'Labour Tasks', value: data?.stats.tasks, icon: ClipboardList, color: 'text-purple-600 bg-purple-50' },
  ];

  return (
    <Layout title="Platform Command Center" subtitle="Real-time oversight and data tools">
      <div className="flex justify-end gap-3 mb-8">
        <button onClick={exportCSV} className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 font-bold px-5 py-2.5 rounded-2xl hover:bg-gray-50 transition-all text-sm shadow-sm">
          <Download size={16} /> Export CSV
        </button>
        <button onClick={exportPDF} className="flex items-center gap-2 bg-gray-900 text-white font-bold px-5 py-2.5 rounded-2xl hover:bg-gray-800 transition-all text-sm shadow-lg shadow-gray-900/20">
          <FileText size={16} /> Export PDF
        </button>
      </div>

      <div id="admin-stats-print">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          {statCards.map((card, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="bg-white rounded-[32px] p-6 shadow-clay-card border border-gray-100 flex flex-col items-center text-center">
              <div className={`w-14 h-14 rounded-2xl ${card.color} flex items-center justify-center mb-4`}>
                <card.icon size={28} />
              </div>
              <div className="text-3xl font-black text-gray-900 mb-1">{card.value}</div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">{card.label}</div>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Revenue Overview */}
          <div className="lg:col-span-1">
             <div className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-[40px] p-8 text-white shadow-xl shadow-green-500/20">
                <h3 className="text-xl font-black mb-6 flex items-center gap-2"><TrendingUp size={24} /> Revenue</h3>
                <div className="space-y-6">
                  <div>
                    <div className="text-green-100 text-xs font-bold uppercase mb-1">Total Marketplace Revenue</div>
                    <div className="text-4xl font-black">₹{(data?.stats.revenue.shop + data?.stats.revenue.rentals).toLocaleString('en-IN')}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/10">
                    <div>
                      <div className="text-green-100 text-[10px] font-bold uppercase">Shop</div>
                      <div className="text-lg font-black">₹{data?.stats.revenue.shop.toLocaleString('en-IN')}</div>
                    </div>
                    <div>
                      <div className="text-green-100 text-[10px] font-bold uppercase">Rentals</div>
                      <div className="text-lg font-black">₹{data?.stats.revenue.rentals.toLocaleString('en-IN')}</div>
                    </div>
                  </div>
                </div>
             </div>
          </div>

          {/* Recent Activity Table */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-[40px] p-8 shadow-clay-card border border-gray-100 h-full">
              <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2"><Calendar size={24} className="text-blue-500" /> Recent Activity</h3>
              <div className="space-y-4">
                {data?.activity.map((act, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-gray-100 hover:border-blue-200 transition-all group">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs ${
                        act.type === 'Order' ? 'bg-green-100 text-green-700' : 
                        act.type === 'Booking' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {act.type[0]}
                      </div>
                      <div>
                        <div className="font-black text-gray-800 text-sm">{act.type} by {act.user || 'Unknown User'}</div>
                        <div className="text-[10px] text-gray-400 font-bold">{new Date(act.date).toLocaleString()}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="font-black text-gray-900 text-sm">₹{act.amount}</div>
                        <div className="text-[10px] text-green-600 font-bold uppercase">Processed</div>
                      </div>
                      <ArrowRight size={14} className="text-gray-300 group-hover:text-blue-500 transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
