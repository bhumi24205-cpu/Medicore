import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { BarChart3, TrendingUp, IndianRupee, PieChart, Activity } from 'lucide-react';

export default function Reports() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/reports/dashboard')
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-center text-slate-400">Loading reports and analytics...</div>;

  const { counts, revenue_by_dept = [], payments_by_mode = [], top_medicines = [], appointments_per_doctor = [] } = data || {};

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-serif text-slate-900">Hospital Analytics & Reports</h1>
        <p className="text-xs text-slate-500 mt-1">
          Visualizing queries <code className="text-teal-700">Q4</code>, <code className="text-teal-700">Q9</code>, <code className="text-teal-700">Q17</code>, and <code className="text-teal-700">Q18</code> across MediCore operations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Q18: Revenue by Department */}
        <div className="bg-white p-6 rounded-xl border border-medicore-border shadow-xs space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-serif font-bold text-base text-slate-900">Department Revenue Breakdown</h3>
              <p className="text-xs text-slate-500">Query Q18: Sum of bill items per clinical department</p>
            </div>
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-teal-50 text-medicore-teal">
              Q18
            </span>
          </div>

          <div className="space-y-3">
            {revenue_by_dept.map(dept => {
              const maxRev = Math.max(...revenue_by_dept.map(d => Number(d.revenue) || 1));
              const pct = Math.round((Number(dept.revenue) / maxRev) * 100);
              return (
                <div key={dept.dept_name} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-800">{dept.dept_name}</span>
                    <span className="font-bold text-slate-900 font-serif">₹{Number(dept.revenue).toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-medicore-teal h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Q17: Payments per Mode */}
        <div className="bg-white p-6 rounded-xl border border-medicore-border shadow-xs space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-serif font-bold text-base text-slate-900">Cash Flow by Payment Channel</h3>
              <p className="text-xs text-slate-500">Query Q17: Payments categorized by payment_mode</p>
            </div>
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-teal-50 text-medicore-teal">
              Q17
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {payments_by_mode.map(mode => (
              <div key={mode.payment_mode} className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{mode.payment_mode}</span>
                <div className="text-xl font-bold text-slate-900 font-serif mt-1">₹{Number(mode.total).toLocaleString()}</div>
                <div className="text-xs text-slate-400 mt-1">{mode.count} settlements</div>
              </div>
            ))}
          </div>
        </div>

        {/* Q9: Most Prescribed Medicines */}
        <div className="bg-white p-6 rounded-xl border border-medicore-border shadow-xs space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-serif font-bold text-base text-slate-900">Top Dispensed Medicines</h3>
              <p className="text-xs text-slate-500">Query Q9: Aggregated prescription_medicine rows</p>
            </div>
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-teal-50 text-medicore-teal">
              Q9
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {top_medicines.map((m, idx) => (
              <div key={m.medicine_name} className="py-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-slate-100 font-bold text-slate-600 flex items-center justify-center text-[10px]">
                    {idx + 1}
                  </span>
                  <span className="font-bold text-slate-800 text-sm">{m.medicine_name}</span>
                </div>
                <span className="font-semibold text-teal-800 bg-teal-50 px-2 py-1 rounded border border-teal-200">
                  {m.times_prescribed} prescriptions
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Q4: Doctor Patient Load */}
        <div className="bg-white p-6 rounded-xl border border-medicore-border shadow-xs space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-serif font-bold text-base text-slate-900">Physician Consult Volume</h3>
              <p className="text-xs text-slate-500">Query Q4: Appointments grouped by doctor</p>
            </div>
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-teal-50 text-medicore-teal">
              Q4
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {appointments_per_doctor.map(doc => (
              <div key={`${doc.first_name}-${doc.last_name}`} className="py-2.5 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-800 text-sm">
                  Dr. {doc.first_name} {doc.last_name}
                </span>
                <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded">
                  {doc.total_appointments} consultations
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
