import { useState } from 'react';

export default function TaskPostForm({ onSubmit }) {
  const [form, setForm] = useState({
    taskType: 'harvesting',
    date: '',
    workersNeeded: 5,
    budget: 600
  });

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  return (
    <div className="rounded-clay shadow-clay-card bg-white/80 backdrop-blur-xl p-6">
      <h2 className="text-lg font-semibold mb-4 text-farmGreen">
        Post Labour Task
      </h2>
      <div className="grid gap-4">
        <select
          name="taskType"
          value={form.taskType}
          onChange={handleChange}
          className="rounded-clay px-4 py-2 bg-clayBg outline-none focus:ring-2 focus:ring-green-500/40"
        >
          <option value="sowing">Sowing</option>
          <option value="harvesting">Harvesting</option>
          <option value="spraying">Spraying</option>
          <option value="irrigation">Irrigation</option>
          <option value="weeding">Weeding</option>
          <option value="transport">Transport</option>
        </select>
        <input
          type="date"
          name="date"
          value={form.date}
          onChange={handleChange}
          className="rounded-clay px-4 py-2 bg-clayBg outline-none focus:ring-2 focus:ring-green-500/40"
        />
        <input
          type="number"
          name="workersNeeded"
          value={form.workersNeeded}
          onChange={handleChange}
          className="rounded-clay px-4 py-2 bg-clayBg outline-none focus:ring-2 focus:ring-green-500/40"
          placeholder="Workers needed"
        />
        <input
          type="number"
          name="budget"
          value={form.budget}
          onChange={handleChange}
          className="rounded-clay px-4 py-2 bg-clayBg outline-none focus:ring-2 focus:ring-green-500/40"
          placeholder="Budget per day"
        />
        <button
          onClick={() => onSubmit(form)}
          className="mt-2 py-2 rounded-clay bg-farmGreen text-white shadow-clay-btn font-bold hover:bg-green-700 transition"
        >
          Find Workers
        </button>
      </div>
    </div>
  );
}