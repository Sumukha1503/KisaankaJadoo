import { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import Layout from '../components/Layout';
import { Loader } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const COLORS = ['#16a34a', '#22c55e', '#86efac', '#bbf7d0'];

const EMPTY_DATA = {
  yieldTrend: [],
  labourUsage: [],
  moduleBreakdown: [],
  stats: { totalUsers: 0, activeListings: 0, scansToday: 0, totalRevenue: 0 }
};

export default function AnalyticsPage() {
  const { t } = useTranslation();
  const { token } = useSelector((s) => s.auth);
  const [data, setData] = useState(EMPTY_DATA);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API}/api/analytics`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => setData(r.data))
      .catch(() => setData(EMPTY_DATA))
      .finally(() => setLoading(false));
  }, []);

  const { role } = useSelector((s) => s.auth);

  const statCards = [
    { label: t('stat_total_users'), value: data.stats.totalUsers?.toLocaleString('en-IN'), icon: '👥', change: '+12%', color: 'green' },
    { label: t('stat_active_listings'), value: data.stats.activeListings, icon: '📋', change: '+5%', color: 'blue' },
    { label: t('stat_total_vehicles'), value: data.stats.vehicles, icon: '🚜', change: '+10%', color: 'purple' },
    { label: t('stat_revenue'), value: `₹${(data.stats.totalRevenue/1000).toFixed(0)}K`, icon: '💰', change: '+23%', color: 'amber' },
  ];

  const adminStats = role === 'ADMIN' ? [
    { label: 'Total Products', value: data.stats.products, icon: '📦' },
    { label: 'Active Tasks', value: data.stats.tasks, icon: '✅' },
    { label: 'AI Scans', value: data.stats.scansToday, icon: '🤖' },
  ] : [];

  return (
    <Layout title={t('analytics_title')} subtitle={t('analytics_sub')}>
      {loading ? (
        <div className="flex items-center justify-center py-20 text-gray-400"><Loader size={24} className="animate-spin mr-3" />{t('loading_analytics')}</div>
      ) : (
        <div className="space-y-8">
          {/* Stat Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {statCards.map(({ label, value, icon, change }) => (
              <div key={label} className="bg-white rounded-[28px] p-6 shadow-xl shadow-gray-100/50 border border-gray-100">
                <div className="flex items-start justify-between mb-6">
                  <div className="text-3xl">{icon}</div>
                  <span className="text-green-600 bg-green-50 text-xs font-bold px-2.5 py-1 rounded-full">{change}</span>
                </div>
                <div className="text-3xl font-black text-gray-900 mb-1">{value}</div>
                <div className="text-sm text-gray-500 font-medium">{label}</div>
              </div>
            ))}

            {/* Admin Specific Stat Cards */}
            {role === 'ADMIN' && adminStats.map(({ label, value, icon }) => (
              <div key={label} className="bg-green-600 rounded-[28px] p-6 shadow-xl shadow-green-200 border border-green-500 text-white">
                <div className="text-3xl mb-4">{icon}</div>
                <div className="text-3xl font-black mb-1">{value}</div>
                <div className="text-sm text-green-100 font-medium">{label}</div>
              </div>
            ))}
          </div>

          {/* Role Breakdown for Admin */}
          {role === 'ADMIN' && data.stats.roles && (
            <div className="bg-white rounded-[32px] p-8 shadow-xl shadow-gray-100/50 border border-gray-100">
              <h3 className="font-black text-gray-900 text-lg mb-6">User Role Breakdown</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {Object.entries(data.stats.roles).map(([roleName, count]) => (
                  <div key={roleName} className="p-4 rounded-2xl bg-gray-50 text-center">
                    <div className="text-2xl font-black text-green-600">{count}</div>
                    <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">{roleName.replace('_', ' ')}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Charts Row 1 */}
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-[32px] p-8 shadow-xl shadow-gray-100/50 border border-gray-100">
              <h3 className="font-black text-gray-900 text-lg mb-6">{t('chart_yield_title')}</h3>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={data.yieldTrend}>
                  <defs>
                    <linearGradient id="yieldGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#16a34a" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9ca3af' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="yield" stroke="#16a34a" strokeWidth={2.5} fill="url(#yieldGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-[32px] p-8 shadow-xl shadow-gray-100/50 border border-gray-100">
              <h3 className="font-black text-gray-900 text-lg mb-6">{t('chart_labour_title')}</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data.labourUsage}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="week" tick={{ fontSize: 12, fill: '#9ca3af' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} />
                  <Tooltip />
                  <Bar dataKey="bookings" fill="#16a34a" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Charts Row 2 */}
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-[32px] p-8 shadow-xl shadow-gray-100/50 border border-gray-100">
              <h3 className="font-black text-gray-900 text-lg mb-6">{t('chart_module_title')}</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={data.moduleBreakdown} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                    {data.moduleBreakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="lg:col-span-2 bg-gradient-to-br from-green-600 to-emerald-700 rounded-[32px] p-8 text-white shadow-xl shadow-green-500/20">
              <h3 className="font-black text-xl mb-2">{t('platform_summary')}</h3>
              <p className="text-green-100 text-sm mb-8">{t('platform_glance')}</p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: t('avg_yield_boost'), value: '+30%' },
                  { label: t('labour_cost_red'), value: '-50%' },
                  { label: t('farmer_income_growth'), value: '2X' },
                  { label: t('success_ai_scans'), value: '98.2%' },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20">
                    <div className="text-3xl font-black mb-1">{value}</div>
                    <div className="text-green-100 text-sm">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
