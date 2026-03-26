import { motion } from 'framer-motion';
import { Calendar, Users, MapPin, IndianRupee, Briefcase, ChevronRight } from 'lucide-react';

export default function TaskCard({ task, onInvite }) {
  const dateStr = new Date(task.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.01 }}
      className="relative overflow-hidden group rounded-[32px] p-6 flex flex-col gap-4 bg-white/40 backdrop-blur-3xl border border-white/60 shadow-[0_20px_50px_rgba(0,0,0,0.05)] transition-all"
    >
      {/* Background Accent Gradient */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-blue-400/10 rounded-full blur-3xl group-hover:bg-blue-400/20 transition-all duration-500" />
      
      <div className="flex justify-between items-start relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <Briefcase size={22} />
          </div>
          <div>
            <h3 className="font-black text-gray-900 text-xl capitalize tracking-tight">{task.taskType}</h3>
            <p className="text-xs text-gray-500 font-medium">by {task.farmerId?.name || 'Farmer'}</p>
          </div>
        </div>
        <div className="bg-white/80 backdrop-blur-md text-blue-600 border border-blue-100 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter shadow-sm">
          {task.status || 'OPEN'}
        </div>
      </div>

      <div className="space-y-3 mt-2 relative z-10">
        <div className="flex items-center gap-2.5 text-gray-600 text-sm font-semibold">
          <div className="p-1.5 rounded-lg bg-gray-100/50">
            <Calendar size={14} className="text-indigo-500" />
          </div>
          {dateStr}
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2.5 text-gray-600 text-sm font-semibold">
             <div className="p-1.5 rounded-lg bg-gray-100/50">
              <Users size={14} className="text-blue-500" />
            </div>
            {task.workersNeeded} workers
          </div>
          <div className="flex items-center gap-2.5 text-gray-600 text-sm font-semibold">
            <div className="p-1.5 rounded-lg bg-gray-100/50">
              <MapPin size={14} className="text-rose-500" />
            </div>
            {task.district || task.farmerId?.district || 'Nearby'}
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-gray-100/50 mt-2">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Rate</span>
          <div className="flex items-center gap-1 text-green-600 text-lg font-black italic">
            <IndianRupee size={16} strokeWidth={3} />
            <span>{task.budget}</span>
            <span className="text-[10px] text-gray-400 font-bold not-italic ml-1">/ DAY</span>
          </div>
        </div>
      </div>

      <button
        onClick={() => onInvite(task)}
        className="w-full mt-2 py-4 rounded-2xl bg-gradient-to-r from-gray-900 via-gray-800 to-black text-white font-black text-sm shadow-xl shadow-gray-900/10 hover:shadow-gray-900/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group/btn"
      >
        <span>Send Invite</span>
        <ChevronRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
      </button>
    </motion.div>
  );
}
