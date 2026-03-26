import { useState, useEffect } from 'react';
import { PlusCircle, Search } from 'lucide-react';

export default function TaskPostForm({ onSubmit, initialData }) {
  const [form, setForm] = useState({
    taskType: 'harvesting',
    date: '',
    workersNeeded: 5,
    budget: 600
  });

  useEffect(() => {
    if (initialData) {
      // Defensive: Ensure date is in YYYY-MM-DD format if it's a string
      let formattedDate = initialData.date || '';
      if (formattedDate && !/^\d{4}-\d{2}-\d{2}$/.test(formattedDate)) {
        const d = new Date(formattedDate);
        if (!isNaN(d.getTime())) {
          formattedDate = d.toISOString().split('T')[0];
        } else {
          formattedDate = ''; 
        }
      }
      setForm(prev => ({ ...prev, ...initialData, date: formattedDate }));
    }
  }, [initialData]);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  return (
    <div className="relative overflow-hidden rounded-[32px] bg-white/40 backdrop-blur-3xl border border-white/60 p-8 shadow-[0_20px_50px_rgba(0,0,0,0.05)]">
      {/* Accent Background */}
      <div className="absolute top-0 left-0 -ml-12 -mt-12 w-32 h-32 bg-green-400/10 rounded-full blur-3xl" />
      
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-farmGreen/10 flex items-center justify-center text-farmGreen">
            <PlusCircle size={20} />
          </div>
          <div>
            <h2 className="text-xl font-black text-gray-900 tracking-tight">Post New Task</h2>
            <p className="text-xs text-gray-500 font-medium">Find reliable workers for your farm</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid gap-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Task Category</label>
            <select
              name="taskType"
              value={form.taskType}
              onChange={handleChange}
              className="w-full rounded-2xl px-4 py-3 bg-white/50 border border-gray-200/50 outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500/40 transition-all font-semibold text-gray-700"
            >
              <option value="sowing">Sowing</option>
              <option value="harvesting">Harvesting</option>
              <option value="spraying">Spraying</option>
              <option value="irrigation">Irrigation</option>
              <option value="weeding">Weeding</option>
              <option value="transport">Transport</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Date</label>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                className="w-full rounded-2xl px-4 py-3 bg-white/50 border border-gray-200/50 outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500/40 transition-all font-semibold text-gray-700"
              />
            </div>
            <div className="grid gap-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Workers</label>
              <input
                type="number"
                name="workersNeeded"
                value={form.workersNeeded}
                onChange={handleChange}
                className="w-full rounded-2xl px-4 py-3 bg-white/50 border border-gray-200/50 outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500/40 transition-all font-semibold text-gray-700"
                placeholder="Count"
              />
            </div>
          </div>

          <div className="grid gap-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Location / District</label>
            <input
              type="text"
              name="district"
              value={form.district || ''}
              onChange={handleChange}
              className="w-full rounded-2xl px-4 py-3 bg-white/50 border border-gray-200/50 outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500/40 transition-all font-semibold text-gray-700"
              placeholder="e.g. Mysuru"
            />
          </div>

          <div className="grid gap-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Budget per Day (₹)</label>
            <input
              type="number"
              name="budget"
              value={form.budget}
              onChange={handleChange}
              className="w-full rounded-2xl px-4 py-3 bg-white/50 border border-gray-200/50 outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500/40 transition-all font-semibold text-gray-700"
              placeholder="Budget"
            />
          </div>

          <button
            onClick={() => onSubmit(form)}
            className="w-full mt-4 py-4 rounded-2xl bg-gradient-to-r from-farmGreen to-green-700 text-white font-black text-sm shadow-xl shadow-green-500/10 hover:shadow-green-500/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <Search size={18} strokeWidth={3} />
            <span>Find Workers</span>
          </button>
        </div>
      </div>
    </div>
  );
}