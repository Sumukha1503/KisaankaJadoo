import { motion } from 'framer-motion';
import { Star, Phone, MessageSquare, MapPin, IndianRupee, User, ChevronRight } from 'lucide-react';

export default function LabourCard({ labour, onBook }) {
  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.01 }}
      className="relative overflow-hidden group rounded-[32px] p-6 flex flex-col gap-4 bg-white/40 backdrop-blur-3xl border border-white/60 shadow-[0_20px_50px_rgba(0,0,0,0.05)] transition-all"
    >
      {/* Background Accent Gradient */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-green-400/10 rounded-full blur-3xl group-hover:bg-green-400/20 transition-all duration-500" />

      <div className="flex justify-between items-start relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-farmGreen to-green-700 flex items-center justify-center text-white shadow-lg shadow-green-500/20">
            <User size={22} />
          </div>
          <div>
            <h3 className="font-black text-gray-900 text-xl tracking-tight">{labour.name}</h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Star size={12} className="text-amber-400 fill-amber-400" />
              <span className="text-xs font-bold text-gray-600">{labour.rating?.toFixed(1)}</span>
              <span className="text-[10px] text-gray-400 font-medium">({labour.jobsCompleted || 0} jobs)</span>
            </div>
          </div>
        </div>
        {labour.isReady && (
          <div className="bg-green-100/80 backdrop-blur-md text-green-700 border border-green-200 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter shadow-sm animate-pulse">
            READY
          </div>
        )}
      </div>

      <div className="space-y-3 mt-1 relative z-10">
        <div className="flex flex-wrap gap-1.5">
          {(labour.skills || []).map((skill, i) => (
            <span key={i} className="px-2.5 py-1 bg-gray-100/50 rounded-lg text-[10px] font-bold text-gray-500 uppercase tracking-wider border border-gray-200/50">
              {skill}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-gray-100/50 mt-2">
          <div className="flex items-center gap-2 text-gray-500 text-xs font-bold">
            <MapPin size={12} />
            {labour.distance !== undefined ? `${(labour.distance / 1000).toFixed(1)} km away` : 'Nearby'}
          </div>
          <div className="flex items-center gap-1 text-farmGreen text-lg font-black italic">
            <IndianRupee size={16} strokeWidth={3} />
            <span>{labour.wage}</span>
            <span className="text-[10px] text-gray-400 font-bold not-italic ml-1">/ DAY</span>
          </div>
        </div>
      </div>

      <div className="flex gap-2.5 mt-2 relative z-10">
        <a
          href={`tel:${labour.phone}`}
          className="p-4 rounded-2xl bg-sky-50 text-sky-600 hover:bg-sky-100 transition-colors shadow-sm border border-sky-100"
          title="Call"
        >
          <Phone size={18} />
        </a>
        <button
          onClick={onBook}
          className={`flex-1 py-4 rounded-2xl font-black text-sm shadow-xl transition-all flex items-center justify-center gap-2 group/btn active:scale-[0.98] ${
            labour.isReady 
              ? 'bg-gradient-to-r from-farmGreen to-green-700 text-white shadow-green-500/10 hover:shadow-green-500/30' 
              : 'bg-gradient-to-r from-gray-900 via-gray-800 to-black text-white shadow-gray-900/10 hover:shadow-gray-900/30'
          }`}
        >
          <span>{labour.isReady ? 'Invite Now' : 'Book Worker'}</span>
          <ChevronRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
        </button>
      </div>
    </motion.div>
  );
}