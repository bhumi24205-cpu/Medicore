import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { Calendar, Plus, Clock, Stethoscope, User, CheckCircle2, XCircle } from 'lucide-react';

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  const fetchAppointments = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter) params.append('status', statusFilter);
    if (dateFilter) params.append('date', dateFilter);

    api.get(`/appointments?${params.toString()}`)
      .then(setAppointments)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAppointments();
  }, [statusFilter, dateFilter]);

  const updateStatus = async (id, newStatus) => {
    try {
      await api.patch(`/appointments/${id}/status`, { status: newStatus });
      fetchAppointments();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-serif text-slate-900">Appointments Schedule</h1>
          <p className="text-xs text-slate-500 mt-1">
            Enforced by MySQL constraint <code className="text-teal-700">UNIQUE(doctor_id, appointment_date, appointment_time)</code>.
          </p>
        </div>
        <Link
          to="/appointments/new"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-medicore-teal hover:bg-medicore-teal-dark text-white text-sm font-semibold shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" /> Book Appointment
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-medicore-border shadow-xs flex flex-wrap gap-4 items-center">
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-2 border border-slate-200 rounded-lg text-xs bg-white"
          >
            <option value="">All Statuses</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
            <option value="No-Show">No-Show</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Date</label>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="p-2 border border-slate-200 rounded-lg text-xs bg-white"
          />
        </div>

        {dateFilter && (
          <button
            onClick={() => setDateFilter('')}
            className="mt-5 text-xs text-slate-500 hover:text-slate-800 underline"
          >
            Clear Date
          </button>
        )}
      </div>

      {/* Appointments Table */}
      <div className="bg-white rounded-xl border border-medicore-border shadow-xs overflow-hidden">
        <div className="table-container">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs uppercase font-semibold">
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Patient</th>
                <th className="py-3 px-4">Doctor & Specialty</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Reason</th>
                <th className="py-3 px-4">Clinical Records</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400">Loading appointments...</td>
                </tr>
              ) : appointments.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400 italic">No appointments found.</td>
                </tr>
              ) : (
                appointments.map(app => (
                  <tr key={app.appointment_id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 font-mono text-xs">{app.appointment_date}</div>
                      <div className="text-xs text-teal-700 flex items-center gap-1 font-semibold">
                        <Clock className="w-3 h-3" /> {app.appointment_time.slice(0, 5)}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Link
                        to={`/patients/${app.patient_id}`}
                        className="font-semibold text-slate-900 hover:text-medicore-teal"
                      >
                        {app.patient_first_name} {app.patient_last_name}
                      </Link>
                      <div className="text-[11px] text-slate-400 font-mono">Patient #{app.patient_id}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-800">
                        Dr. {app.doctor_first_name} {app.doctor_last_name}
                      </div>
                      <div className="text-xs text-slate-500">{app.specialization} ({app.dept_name})</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {app.appointment_type}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                        app.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        app.status === 'Scheduled' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                        app.status === 'Cancelled' ? 'bg-red-50 text-red-700 border border-red-200' :
                        'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-600 max-w-xs truncate">
                      {app.reason}
                    </td>
                    <td className="py-3 px-4 text-xs">
                      <div className="flex gap-1.5">
                        {app.has_prescription && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-teal-50 text-teal-800 font-bold border border-teal-200">
                            Prescription ✓
                          </span>
                        )}
                        {app.has_lab_order && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-purple-50 text-purple-800 font-bold border border-purple-200">
                            Lab ✓
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex justify-end gap-1.5">
                        <Link
                          to={`/appointments/${app.appointment_id}`}
                          className="px-2.5 py-1 rounded text-xs font-semibold bg-slate-100 hover:bg-medicore-teal hover:text-white transition-colors"
                        >
                          View / Clinical
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
