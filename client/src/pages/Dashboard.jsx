import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  Users,
  Stethoscope,
  Calendar,
  Bed,
  IndianRupee,
  TrendingUp,
  Activity,
  AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get('/reports/dashboard')
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-medicore-teal"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-red-800">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-600" /> Database Connection Warning
        </h3>
        <p className="mt-2 text-sm">Could not fetch live dashboard metrics: {error.message}</p>
        <p className="mt-1 text-xs text-red-600">Ensure MySQL is running on port 3306 and password is set in server/.env.</p>
      </div>
    );
  }

  const { counts, revenue_by_dept = [], payments_by_mode = [], top_medicines = [], appointments_per_doctor = [] } = data || {};

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-medicore-sidebar to-slate-800 rounded-xl p-6 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold tracking-tight">
            Welcome back, {user?.username}
          </h1>
          <p className="text-slate-300 text-sm mt-1">
            Role: <span className="text-medicore-teal font-semibold">{user?.role}</span> · Real-time data from <code className="text-xs bg-black/30 px-2 py-0.5 rounded text-teal-300">medicore_transactional</code>
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/lab-tools/query-explorer"
            className="px-4 py-2 rounded-lg bg-medicore-teal hover:bg-medicore-teal-dark text-white text-xs font-semibold shadow-sm transition-colors"
          >
            Query Explorer (Q1–B2)
          </Link>
          {user?.role === 'Admin' && (
            <Link
              to="/lab-tools/rule-tests"
              className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold shadow-sm transition-colors"
            >
              Rule Lab (T1–T16)
            </Link>
          )}
        </div>
      </div>

      {/* Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-xl border border-medicore-border shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase">Total Patients</span>
            <Users className="w-5 h-5 text-medicore-teal" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2 font-serif">{counts?.patients || 0}</div>
          <div className="text-[11px] text-slate-400 mt-1">Registered in database</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-medicore-border shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase">Active Doctors</span>
            <Stethoscope className="w-5 h-5 text-medicore-teal" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2 font-serif">{counts?.active_doctors || 0}</div>
          <div className="text-[11px] text-slate-400 mt-1">Across 10 departments</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-medicore-border shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase">Appointments</span>
            <Calendar className="w-5 h-5 text-medicore-teal" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2 font-serif">{counts?.today_appointments || 0}</div>
          <div className="text-[11px] text-slate-400 mt-1">Scheduled for today</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-medicore-border shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase">Inpatients</span>
            <Bed className="w-5 h-5 text-medicore-teal" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2 font-serif">{counts?.admitted_patients || 0}</div>
          <div className="text-[11px] text-slate-400 mt-1">Currently admitted</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-medicore-border shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase">Total Revenue</span>
            <IndianRupee className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-700 mt-2 font-serif">
            ₹{Number(counts?.total_revenue || 0).toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Settled payments</div>
        </div>
      </div>

      {/* Analytics Rows */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Department (Q18) */}
        <div className="bg-white p-6 rounded-xl border border-medicore-border shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-serif font-bold text-base text-slate-900">Revenue per Department</h3>
              <p className="text-xs text-slate-500">Query Q18: Aggregated bill items across departments</p>
            </div>
            <span className="text-xs font-mono font-semibold px-2 py-0.5 bg-slate-100 text-slate-700 rounded">
              Q18
            </span>
          </div>

          <div className="space-y-3">
            {revenue_by_dept.length === 0 && (
              <div className="text-sm text-slate-400 italic py-4">No department revenue records yet.</div>
            )}
            {revenue_by_dept.map((dep, idx) => {
              const maxRev = Math.max(...revenue_by_dept.map(d => Number(d.revenue) || 1));
              const pct = Math.round((Number(dep.revenue) / maxRev) * 100);
              return (
                <div key={dep.dept_name} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-700">{dep.dept_name}</span>
                    <span className="font-semibold text-slate-900">₹{Number(dep.revenue).toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-medicore-teal h-2 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Payments per Mode (Q17) */}
        <div className="bg-white p-6 rounded-xl border border-medicore-border shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-serif font-bold text-base text-slate-900">Collections by Payment Mode</h3>
              <p className="text-xs text-slate-500">Query Q17: Payments grouped by payment_mode</p>
            </div>
            <span className="text-xs font-mono font-semibold px-2 py-0.5 bg-slate-100 text-slate-700 rounded">
              Q17
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {payments_by_mode.map(mode => (
              <div key={mode.payment_mode} className="p-3 rounded-lg border border-slate-100 bg-slate-50/70">
                <div className="text-xs text-slate-500 uppercase tracking-wider">{mode.payment_mode}</div>
                <div className="text-lg font-bold text-slate-900 font-serif mt-1">₹{Number(mode.total).toLocaleString()}</div>
                <div className="text-[11px] text-slate-500">{mode.count} transaction{mode.count > 1 ? 's' : ''}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Prescribed Medicines (Q9) */}
        <div className="bg-white p-6 rounded-xl border border-medicore-border shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-serif font-bold text-base text-slate-900">Top Prescribed Medicines</h3>
              <p className="text-xs text-slate-500">Query Q9: GROUP BY prescription_medicine</p>
            </div>
            <span className="text-xs font-mono font-semibold px-2 py-0.5 bg-slate-100 text-slate-700 rounded">
              Q9
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {top_medicines.map((m, idx) => (
              <div key={m.medicine_name} className="py-2.5 flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-bold">
                    {idx + 1}
                  </span>
                  <span className="font-medium text-slate-800">{m.medicine_name}</span>
                </div>
                <span className="text-xs font-semibold px-2 py-1 rounded bg-teal-50 text-medicore-teal">
                  {m.times_prescribed} prescriptions
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Appointments per Doctor (Q4) */}
        <div className="bg-white p-6 rounded-xl border border-medicore-border shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-serif font-bold text-base text-slate-900">Doctor Patient Load</h3>
              <p className="text-xs text-slate-500">Query Q4: Appointments per doctor</p>
            </div>
            <span className="text-xs font-mono font-semibold px-2 py-0.5 bg-slate-100 text-slate-700 rounded">
              Q4
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {appointments_per_doctor.map(doc => (
              <div key={`${doc.first_name}-${doc.last_name}`} className="py-2.5 flex items-center justify-between text-sm">
                <div className="font-medium text-slate-800">
                  Dr. {doc.first_name} {doc.last_name}
                </div>
                <span className="text-xs font-semibold text-slate-700">
                  {doc.total_appointments} patient{doc.total_appointments === 1 ? '' : 's'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
