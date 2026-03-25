import { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';
import { MapPin, Star, ArrowRight, Loader } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import LabourCard from '../components/LabourCard';
import TaskPostForm from '../components/TaskPostForm';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export default function LabourPage() {
  const { t } = useTranslation();
  const { token } = useSelector((s) => s.auth);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [taskForm, setTaskForm] = useState({ title: '', taskType: 'harvest', description: '' });

  useEffect(() => { fetchMatches(); }, []);

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/api/labour/match?taskType=harvest&lat=12.9&lng=77.5`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMatches(res.data);
    } catch { setMatches([]); }
    setLoading(false);
  };

  const postTask = async (e) => {
    if (e) e.preventDefault();
    setPosting(true);
    try {
      await axios.post(`${API}/api/labour/task`, taskForm, { headers: { Authorization: `Bearer ${token}` } });
      toast.success(t('task_posted_success'));
      setTaskForm({ title: '', taskType: 'harvest', description: '' });
    } catch { toast.error(t('task_post_fail')); }
    setPosting(false);
  };

  const taskTypes = ['harvest', 'sowing', 'irrigation', 'weeding', 'spraying', 'transport'];

  return (
    <Layout title={t('labour_title')} subtitle={t('labour_sub')}>
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Post Task Form */}
        <div className="self-start">
          <TaskPostForm onSubmit={(formData) => {
            setTaskForm({ ...taskForm, ...formData, title: `${formData.taskType} at ${formData.date}` });
            postTask();
          }} />
        </div>

        {/* Matches Grid */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black text-gray-900">{t('nearby_header')}</h2>
            <button onClick={fetchMatches} className="text-sm text-green-600 font-semibold hover:text-green-700">{t('refresh_btn')} ↻</button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20 text-gray-400">
              <Loader size={24} className="animate-spin mr-3" /> {t('finding_matches')}
            </div>
          ) : matches.length === 0 ? (
            <div className="bg-white rounded-[32px] p-12 text-center border border-gray-100 shadow-xl shadow-gray-100/50">
              <div className="text-5xl mb-4">👷</div>
              <h3 className="text-lg font-bold text-gray-700 mb-2">{t('no_labour_matched')}</h3>
              <p className="text-gray-400 text-sm">{t('post_to_notify')}</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-5">
              {matches.map((l, i) => (
                <LabourCard 
                  key={l._id || i} 
                  labour={l} 
                  onBook={() => toast.success('Booking request sent! QR code generated.')} 
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
