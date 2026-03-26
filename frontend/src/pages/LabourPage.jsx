import { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { useLocation as useLocationRouter } from 'react-router-dom';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';
import { MapPin, Star, ArrowRight, Loader } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import LabourCard from '../components/LabourCard';
import TaskCard from '../components/TaskCard';
import TaskPostForm from '../components/TaskPostForm';

import { useLocation } from '../hooks/useLocation';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export default function LabourPage() {
  const { t } = useTranslation();
  const { coords } = useLocation();
  const { token, role } = useSelector((s) => s.auth);
  const [labourProfile, setLabourProfile] = useState(null);
  const [readyWorkers, setReadyWorkers] = useState([]);
  const [matches, setMatches] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [invites, setInvites] = useState([]);
  const [myTasks, setMyTasks] = useState([]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedLabour, setSelectedLabour] = useState(null);

  useEffect(() => {
    if (role === 'LABOUR') {
      fetchTasks();
      fetchMyProfile();
      fetchInvites();
    } else {
      fetchMatches();
      fetchReadyWorkers();
      fetchMyTasks();
      fetchInvites();
    }
  }, [role, coords, token]);

  const fetchInvites = async () => {
    try {
      const res = await axios.get(`${API}/api/labour/invites/my`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      setInvites(res.data);
    } catch { setInvites([]); }
  };

  const fetchMyTasks = async () => {
    try {
      const res = await axios.get(`${API}/api/labour/tasks/my`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      setMyTasks(res.data);
    } catch { setMyTasks([]); }
  };

  const handleUpdateInvite = async (id, status) => {
    try {
      await axios.patch(`${API}/api/labour/invite/${id}/status`, { status }, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      toast.success(`Invite ${status}! ✨`);
      fetchInvites();
    } catch {
      toast.error('Failed to update invite');
    }
  };

  const [showSuccess, setShowSuccess] = useState(false);
  const [successData, setSuccessData] = useState(null);

  const initiateInvite = (labour) => {
    if (myTasks.length === 0) {
      toast.error('You need to post a task first!');
      return;
    }
    if (myTasks.length === 1) {
      submitInvite(labour.userId, myTasks[0]._id);
    } else {
      setSelectedLabour(labour);
      setShowInviteModal(true);
    }
  };

  const submitInvite = async (labourId, taskId) => {
    try {
      await axios.post(`${API}/api/labour/invite-labourer`, { labourId, taskId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccessData({ title: 'Invite Sent!', sub: 'The worker has been notified via email.', item: 'Labour Invite' });
      setShowSuccess(true);
      toast.success(`Invite sent successfully! ✨`);
      setShowInviteModal(false);
      fetchInvites();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send invite');
    }
  };

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const url = coords && coords.lat && coords.lng
        ? `${API}/api/labour/match?taskType=harvest&lat=${coords.lat}&lng=${coords.lng}`
        : `${API}/api/labour/match?taskType=harvest`;
        
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMatches(Array.isArray(res.data) ? res.data : []);
    } catch { setMatches([]); }
    setLoading(false);
  };

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const url = coords && coords.lat && coords.lng
        ? `${API}/api/labour/tasks/all?lat=${coords.lat}&lng=${coords.lng}`
        : `${API}/api/labour/tasks/all`;
        
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasks(Array.isArray(res.data) ? res.data : []);
    } catch { setTasks([]); }
    setLoading(false);
  };

  const fetchMyProfile = async () => {
    try {
      const profile = await axios.get(`${API}/api/labour/my-profile`, { headers: { Authorization: `Bearer ${token}` } });
      setLabourProfile(profile.data);
    } catch { setLabourProfile(null); }
  };

  const fetchReadyWorkers = async () => {
    try {
      const res = await axios.get(`${API}/api/labour/available`, { headers: { Authorization: `Bearer ${token}` } });
      setReadyWorkers(Array.isArray(res.data) ? res.data : []);
    } catch { setReadyWorkers([]); }
  };

  const toggleReady = async () => {
    try {
      const newStatus = !labourProfile?.isReady;
      const res = await axios.patch(`${API}/api/labour/ready`, { isReady: newStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLabourProfile(res.data);
      toast.success(newStatus ? 'You are now READY to work! ✨' : 'Offline mode activated.');
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleInvite = async (labour) => {
    initiateInvite(labour);
  };

  const postTask = async (formData) => {
    setPosting(true);
    try {
      const payload = { 
        ...formData,
        district: formData.district || 'Mysuru',
        lat: coords?.lat,
        lng: coords?.lng
      };
      await axios.post(`${API}/api/labour/task`, payload, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      setSuccessData({ title: 'Task Published!', sub: 'Nearby workers are being notified.', item: formData.taskType });
      setShowSuccess(true);
      toast.success(t('task_posted_success'));
      if (role !== 'LABOUR') fetchMatches();
      fetchMyTasks();
    } catch (err) { 
      console.error('Post task error:', err.response?.data || err.message);
      toast.error(t('task_post_fail')); 
    }
    setPosting(false);
  };

  const sendInvite = async (task) => {
    try {
      await axios.post(`${API}/api/labour/task/${task._id}/invite`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccessData({ title: 'Interest Notified!', sub: 'The farmer will review your profile.', item: task.taskType });
      setShowSuccess(true);
      toast.success('Invite sent to farmer successfully! ✨');
    } catch {
      toast.error('Failed to send invite');
    }
  };

  const taskTypes = ['harvest', 'sowing', 'irrigation', 'weeding', 'spraying', 'transport'];


  return (
    <Layout title={role === 'LABOUR' ? 'Job Board' : t('labour_title')} subtitle={role === 'LABOUR' ? 'Find farming work near you' : t('labour_sub')}>
      
      {/* Invite Selection Modal for Farmers */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-[32px] p-8 w-full max-w-md shadow-2xl relative">
            <h3 className="text-2xl font-black mb-2">Select Task</h3>
            <p className="text-gray-500 text-sm mb-6 font-medium">Which job do you want to invite {selectedLabour?.name} for?</p>
            <div className="space-y-3 mb-8 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
              {myTasks.map(task => (
                <button
                  key={task._id}
                  onClick={() => submitInvite(selectedLabour.userId, task._id)}
                  className="w-full p-4 rounded-2xl border-2 border-gray-100 hover:border-green-500 hover:bg-green-50 transition-all text-left flex items-center justify-between group"
                >
                  <div>
                    <span className="font-black text-gray-900 capitalize">{task.taskType}</span>
                    <p className="text-xs text-gray-500 font-bold">{new Date(task.date).toLocaleDateString()}</p>
                  </div>
                  <ArrowRight size={18} className="text-gray-300 group-hover:text-green-500 transition-colors" />
                </button>
              ))}
            </div>
            <button onClick={() => setShowInviteModal(false)} className="w-full py-4 rounded-2xl font-bold text-gray-500 hover:bg-gray-50 transition-colors text-sm">Cancel</button>
          </motion.div>
        </div>
      )}

      <div className={role === 'LABOUR' ? 'space-y-8' : 'grid lg:grid-cols-3 gap-8'}>
        {/* Labourer View: Ready to Work Toggle */}
        {role === 'LABOUR' && (
          <div className="grid lg:grid-cols-3 gap-8 w-full">
            <div className="lg:col-span-2">
              {/* Ready to Work Toggle Box (Existing) */}
              <div className="relative overflow-hidden rounded-[32px] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.05)] bg-white/40 backdrop-blur-3xl border border-white/60 mb-8 group">
                 {/* Glow effect when ready */}
                 {labourProfile?.isReady && (
                   <div className="absolute inset-0 bg-green-400/5 animate-pulse" />
                 )}
                 <div className="absolute top-0 right-0 -mr-12 -mt-12 w-32 h-32 bg-green-400/10 rounded-full blur-3xl group-hover:bg-green-400/20 transition-all" />
                 
                <div className="relative z-10 flex items-center justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-2xl font-black text-gray-900 tracking-tight">
                        {labourProfile?.isReady ? 'Ready to Work' : 'Currently Offline'}
                      </h3>
                      {labourProfile?.isReady && (
                        <span className="flex h-2 w-2 rounded-full bg-green-500 animate-ping" />
                      )}
                    </div>
                    <p className="text-gray-500 text-sm font-medium leading-relaxed max-w-md">
                      {labourProfile?.isReady 
                        ? 'Your profile is live! Farmers in your area can now see your availability and send direct work invites.' 
                        : 'Switch to READY to start receiving instant job invitations and booking requests from nearby farmers.'}
                    </p>
                  </div>
                  
                  <button 
                    onClick={toggleReady}
                    className={`relative w-20 h-10 rounded-full transition-all duration-300 p-1 shadow-inner ${
                      labourProfile?.isReady ? 'bg-gradient-to-r from-farmGreen to-green-600' : 'bg-gray-200'
                    }`}
                  >
                    <div 
                      className={`w-8 h-8 bg-white rounded-full shadow-lg transform transition-transform duration-300 flex items-center justify-center ${
                        labourProfile?.isReady ? 'translate-x-10' : 'translate-x-0'
                      }`}
                    >
                      {labourProfile?.isReady ? (
                        <span className="text-[10px] font-black text-green-600">ON</span>
                      ) : (
                        <span className="text-[10px] font-black text-gray-400">OFF</span>
                      )}
                    </div>
                  </button>
                </div>
              </div>

              {/* Invites Received Section for Laborers */}
              {invites.filter(i => i.status === 'pending' && i.farmerId).length > 0 && (
                <div className="mb-8 p-8 rounded-[32px] bg-gradient-to-br from-indigo-600 to-blue-700 text-white shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
                  <h3 className="text-xl font-black mb-4 flex items-center gap-2 relative z-10">
                    <span className="w-2 h-2 bg-white rounded-full animate-ping" />
                    Direct Invitations for You!
                  </h3>
                  <div className="space-y-4 relative z-10">
                    {invites.filter(i => i.status === 'pending' && i.farmerId).map((inv) => (
                      <div key={inv._id} className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 flex items-center justify-between">
                        <div>
                          <h4 className="font-bold">{inv.farmerId?.name}</h4>
                          <p className="text-xs text-white/70 italic">Wants you for: {inv.taskId?.taskType || 'Farming Task'}</p>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => handleUpdateInvite(inv._id, 'accepted')} className="px-4 py-2 bg-white text-indigo-600 rounded-xl text-xs font-black shadow-lg">Accept</button>
                          <button onClick={() => handleUpdateInvite(inv._id, 'rejected')} className="px-4 py-2 bg-indigo-500/50 text-white rounded-xl text-xs font-black border border-white/20">Decline</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar for Labourers (Stats or History) */}
            <div className="space-y-6">
               <div className="p-6 rounded-[32px] bg-white border border-gray-100 shadow-sm text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gray-50 mx-auto mb-4 flex items-center justify-center text-gray-400">
                    <Star size={32} />
                  </div>
                  <h4 className="font-black text-gray-900">{labourProfile?.rating?.toFixed(1) || '0.0'} Rating</h4>
                  <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">{labourProfile?.jobsCompleted || 0} Jobs Done</p>
               </div>
            </div>
          </div>
        )}

        {/* Farmer View: Post Task Form */}
        {role !== 'LABOUR' && (
          <div className="self-start">
            <TaskPostForm 
              initialData={useLocationRouter().state?.voiceParams}
              onSubmit={(formData) => {
                postTask(formData);
              }} 
            />
          </div>
        )}

        {/* Labour Matches or Job Board */}
        <div className={role === 'LABOUR' ? 'w-full' : 'lg:col-span-2'}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black text-gray-900">
              {role === 'LABOUR' ? 'Available Work' : t('nearby_header')}
            </h2>
            <button 
              onClick={role === 'LABOUR' ? fetchTasks : fetchMatches} 
              className="text-sm text-green-600 font-semibold hover:text-green-700"
            >
              {t('refresh_btn')} ↻
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20 text-gray-400">
              <Loader size={24} className="animate-spin mr-3" /> {role === 'LABOUR' ? 'Finding tasks...' : t('finding_matches')}
            </div>
          ) : (
            <div className="space-y-12">
              {/* Ready Workers Section for Farmers */}
              {role !== 'LABOUR' && readyWorkers.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
                    Available Now (Ready)
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-5">
                    {readyWorkers.map((l, i) => (
                      <LabourCard 
                        key={l._id || i} 
                        labour={l} 
                        onBook={() => handleInvite(l)} 
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Regular Matches or Jobs */}
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4">
                  {role === 'LABOUR' ? 'Job Board' : 'Nearby Recommendations'}
                </h3>
                <div className="grid sm:grid-cols-2 gap-5">
                  {(role === 'LABOUR' ? tasks : matches).length === 0 ? (
                    <div className="col-span-full py-20 text-center text-gray-400">
                      {role === 'LABOUR' ? 'No work found' : 'No workers nearby'}
                    </div>
                  ) : (
                    (role === 'LABOUR' ? tasks : matches).map((item, i) => (
                      role === 'LABOUR' ? (
                        <TaskCard key={item._id || i} task={item} onInvite={sendInvite} />
                      ) : (
                        <LabourCard key={item._id || i} labour={item} onBook={() => toast.success('Booking requested.')} />
                      )
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {showSuccess && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-[32px] p-8 max-w-sm w-full text-center shadow-2xl">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-600">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-10 h-10"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-2">{successData?.title || 'Confirmed!'}</h2>
            <p className="text-gray-500 mb-6">{successData?.sub || 'Check your email for details.'}</p>
            
            <div className="bg-gray-50 rounded-2xl p-4 mb-6 text-left border border-gray-100">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Item / Task</div>
              <div className="font-bold text-gray-800 mb-3 capitalize">{successData?.item}</div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Status</div>
              <div className="flex items-center gap-2 text-blue-600 font-bold">
                <div className="w-2 h-2 rounded-full bg-blue-600"></div> {t('confirmed', 'Confirmed')}
              </div>
            </div>

            <button onClick={() => setShowSuccess(false)}
              className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20">
              {t('done_btn', 'Awesome!') || 'Got it!'}
            </button>
          </motion.div>
        </div>
      )}
    </Layout>

  );
}
