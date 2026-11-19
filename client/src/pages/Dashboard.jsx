import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  Users,
  Stethoscope,
  Calendar,
  Bed,
  IndianRupee,
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#16A6A1]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-2xl text-red-800">
        <h3 className="font-heading font-bold text-base flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-600" /> Database Connection Warning
        </h3>
        <p className="mt-2 text-xs sm:text-sm">Could not fetch live dashboard metrics: {error.message}</p>
        <p className="mt-1 text-xs text-red-600">Ensure MySQL is running on port 3306 and password is configured.</p>
      </div>
    );
  }

  const { counts, revenue_by_dept = [], payments_by_mode = [], top_medicines = [], appointments_per_doctor = [] } = data || {};

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-[#123B5D] rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 border border-[#0C273E]">
        <div>
          <h1 className="text-xl sm:text-2xl font-heading font-bold tracking-tight">
            Clinical Operations Dashboard
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-1">
            Logged in as <span className="text-[#35C2BD] font-semibold">{user?.username}</span> · Role: <span className="text-[#DDF3EE] font-semibold">{user?.role}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/lab-tools/query-explorer"
            className="px-3.5 py-2 rounded-xl bg-[#16A6A1] hover:bg-[#118480] text-white text-xs font-semibold shadow-xs transition-colors"
          >
            Database Query Explorer
          </Link>
          {user?.role === 'Admin' && (
            <Link
              to="/lab-tools/rule-tests"
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 shadow-xs transition-colors"
            >
              Schema Constraint Audit
            </Link>
          )}
        </div>
      </div>

      {/* Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#E1EDF5] shadow-xs">
          <div className="flex items-center justify-between text-[#657B8F]">
            <span className="text-xs font-bold uppercase tracking-wider">Total Patients</span>
            <Users className="w-5 h-5 text-[#16A6A1]" />
          </div>
          <div className="text-2xl font-bold text-[#123B5D] mt-2 font-heading">{counts?.patients || 0}</div>
          <div className="text-xs text-[#657B8F] mt-1">Registered In Patients Registry</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E1EDF5] shadow-xs">
          <div className="flex items-center justify-between text-[#657B8F]">
            <span className="text-xs font-bold uppercase tracking-wider">Active Physicians</span>
            <Stethoscope className="w-5 h-5 text-[#16A6A1]" />
          </div>
          <div className="text-2xl font-bold text-[#123B5D] mt-2 font-heading">{counts?.active_doctors || 0}</div>
          <div className="text-xs text-[#657B8F] mt-1">Across 10 Clinical Specialities</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E1EDF5] shadow-xs">
          <div className="flex items-center justify-between text-[#657B8F]">
            <span className="text-xs font-bold uppercase tracking-wider">Appointments</span>
            <Calendar className="w-5 h-5 text-[#16A6A1]" />
          </div>
          <div className="text-2xl font-bold text-[#123B5D] mt-2 font-heading">{counts?.today_appointments || 0}</div>
          <div className="text-xs text-[#657B8F] mt-1">Scheduled For Today</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E1EDF5] shadow-xs">
          <div className="flex items-center justify-between text-[#657B8F]">
            <span className="text-xs font-bold uppercase tracking-wider">Inpatients</span>
            <Bed className="w-5 h-5 text-[#16A6A1]" />
          </div>
          <div className="text-2xl font-bold text-[#123B5D] mt-2 font-heading">{counts?.admitted_patients || 0}</div>
          <div className="text-xs text-[#657B8F] mt-1">Currently Admitted</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E1EDF5] shadow-xs">
          <div className="flex items-center justify-between text-[#657B8F]">
            <span className="text-xs font-bold uppercase tracking-wider">Settled Revenue</span>
            <IndianRupee className="w-5 h-5 text-[#16A6A1]" />
          </div>
          <div className="text-2xl font-bold text-[#123B5D] mt-2 font-heading">
            ₹{Number(counts?.total_revenue || 0).toLocaleString()}
          </div>
          <div className="text-xs text-[#657B8F] mt-1">Completed Payments</div>
        </div>
      </div>

      {/* Analytics Rows */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Department */}
        <div className="bg-white p-6 rounded-2xl border border-[#E1EDF5] shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-heading font-bold text-base text-[#123B5D]">Departmental Revenue Summary</h3>
              <p className="text-xs text-[#657B8F]">Aggregated bill items across clinical departments</p>
            </div>
            <span className="text-xs font-mono font-semibold px-2 py-0.5 bg-[#F5FAFC] text-[#123B5D] rounded border border-[#E1EDF5]">
              Q18
            </span>
          </div>

          <div className="space-y-3">
            {revenue_by_dept.length === 0 && (
              <div className="text-xs text-[#657B8F] italic py-4">No departmental revenue records available.</div>
            )}
            {revenue_by_dept.map((dep) => {
              const maxRev = Math.max(...revenue_by_dept.map(d => Number(d.revenue) || 1));
              const pct = Math.round((Number(dep.revenue) / maxRev) * 100);
              return (
                <div key={dep.dept_name} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-[#263746]">{dep.dept_name}</span>
                    <span className="font-semibold text-[#123B5D]">₹{Number(dep.revenue).toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-[#F5FAFC] h-2 rounded-full overflow-hidden border border-[#E1EDF5]">
                    <div
                      className="bg-[#16A6A1] h-2 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Collections by Payment Mode */}
        <div className="bg-white p-6 rounded-2xl border border-[#E1EDF5] shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-heading font-bold text-base text-[#123B5D]">Collections by Payment Channel</h3>
              <p className="text-xs text-[#657B8F]">Payments categorized by settlement mode</p>
            </div>
            <span className="text-xs font-mono font-semibold px-2 py-0.5 bg-[#F5FAFC] text-[#123B5D] rounded border border-[#E1EDF5]">
              Q17
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {payments_by_mode.map(mode => (
              <div key={mode.payment_mode} className="p-3.5 rounded-xl border border-[#E1EDF5] bg-[#F5FAFC]">
                <div className="text-xs font-bold text-[#657B8F] uppercase tracking-wider">{mode.payment_mode}</div>
                <div className="text-lg font-bold text-[#123B5D] font-heading mt-1">₹{Number(mode.total).toLocaleString()}</div>
                <div className="text-xs text-[#657B8F] mt-0.5">{mode.count} transaction{mode.count > 1 ? 's' : ''}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Prescribed Medicines */}
        <div className="bg-white p-6 rounded-2xl border border-[#E1EDF5] shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-heading font-bold text-base text-[#123B5D]">Prescription Volume by Medicine</h3>
              <p className="text-xs text-[#657B8F]">Frequently prescribed pharmaceuticals</p>
            </div>
            <span className="text-xs font-mono font-semibold px-2 py-0.5 bg-[#F5FAFC] text-[#123B5D] rounded border border-[#E1EDF5]">
              Q9
            </span>
          </div>

          <div className="divide-y divide-[#E1EDF5]">
            {top_medicines.map((m, idx) => (
              <div key={m.medicine_name} className="py-2.5 flex items-center justify-between text-xs sm:text-sm">
                <div className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded-md bg-[#F5FAFC] border border-[#E1EDF5] text-[#123B5D] flex items-center justify-center text-xs font-bold">
                    {idx + 1}
                  </span>
                  <span className="font-medium text-[#263746]">{m.medicine_name}</span>
                </div>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#DDF3EE] text-[#0C685B]">
                  {m.times_prescribed} Prescriptions
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Appointments per Doctor */}
        <div className="bg-white p-6 rounded-2xl border border-[#E1EDF5] shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-heading font-bold text-base text-[#123B5D]">Physician Outpatient Consultation Load</h3>
              <p className="text-xs text-[#657B8F]">Consultation volume by attending physician</p>
            </div>
            <span className="text-xs font-mono font-semibold px-2 py-0.5 bg-[#F5FAFC] text-[#123B5D] rounded border border-[#E1EDF5]">
              Q4
            </span>
          </div>

          <div className="divide-y divide-[#E1EDF5]">
            {appointments_per_doctor.map(doc => (
              <div key={`${doc.first_name}-${doc.last_name}`} className="py-2.5 flex items-center justify-between text-xs sm:text-sm">
                <div className="font-medium text-[#263746]">
                  Dr. {doc.first_name} {doc.last_name}
                </div>
                <span className="text-xs font-semibold text-[#123B5D]">
                  {doc.total_appointments} Consultation{doc.total_appointments === 1 ? '' : 's'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
