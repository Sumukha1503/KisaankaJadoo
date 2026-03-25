import { motion } from 'framer-motion';

export default function LabourCard({ labour, onBook }) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      className="clay-md-green rounded-clay p-4 flex flex-col gap-2 shadow-clay-card backdrop-blur-xl bg-white/80"
    >
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-farmGreen">{labour.name}</h3>
        <span className="text-sm">⭐ {labour.rating?.toFixed(1)}</span>
      </div>
      <div className="text-sm text-gray-600">
        {(labour.skills || []).join(', ')}
      </div>
      <div className="flex justify-between text-sm">
        <span>₹{labour.wage}/day</span>
        <span>{(labour.distance / 1000).toFixed(1)} km</span>
      </div>
      <div className="flex gap-2 mt-2">
        <a
          href={`tel:${labour.phone}`}
          className="flex-1 text-center py-2 rounded-clay bg-skyBlue text-white shadow-clay-btn text-sm"
        >
          Call
        </a>
        <a
          href={`https://wa.me/91${labour.phone}`}
          target="_blank"
          rel="noreferrer"
          className="flex-1 text-center py-2 rounded-clay bg-green-500 text-white shadow-clay-btn text-sm"
        >
          WhatsApp
        </a>
        <button
          onClick={onBook}
          className="flex-1 text-center py-2 rounded-clay bg-farmGreen text-white shadow-clay-btn text-sm"
        >
          Book
        </button>
      </div>
    </motion.div>
  );
}