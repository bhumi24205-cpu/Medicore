import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { Video, Calendar, Clock, Stethoscope, Mail, Phone, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/doctors' + (selectedDept ? `?dept_id=${selectedDept}` : '')),
      api.get('/doctors/departments/list')
    ])
      .then(([docs, depts]) => {
        setDoctors(docs);
        setDepartments(depts);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedDept]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-serif text-slate-900">Medical Directory</h1>
          <p className="text-xs text-slate-500 mt-1">
            Doctors and specialties. Experience derived from <code className="text-teal-700">v_doctor</code> view; video consultation from JSON <code className="text-teal-700">slot_config</code> (J4).
          </p>
        </div>

        {/* Filter by Department */}
        <div className="w-64">
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="w-full p-2 text-xs border border-slate-200 rounded-lg bg-white font-medium"
          >
            <option value="">All Departments</option>
            {departments.map(d => (
              <option key={d.dept_id} value={d.dept_id}>
                {d.dept_name} (Floor {d.floor_no})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Doctors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-12 text-slate-400">Loading doctor profiles...</div>
        ) : doctors.length === 0 ? (
          <div className="col-span-full text-center py-12 text-slate-400 italic">No doctors found.</div>
        ) : (
          doctors.map(doc => (
            <div
              key={doc.doctor_id}
              className="bg-white rounded-xl border border-medicore-border p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-serif font-bold text-lg text-slate-900">
                      Dr. {doc.first_name} {doc.last_name}
                    </h3>
                    <div className="text-xs font-semibold text-medicore-teal">{doc.specialization}</div>
                    <div className="text-[11px] text-slate-500">{doc.qualification} · Lic #{doc.license_no}</div>
                  </div>
                  {/* J4 Video Badge */}
                  {doc.offers_video && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                      <Video className="w-3 h-3" /> Video (J4)
                    </span>
                  )}
                </div>

                <div className="p-3 bg-slate-50 rounded-lg space-y-1.5 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Department:</span>
                    <span className="font-medium text-slate-800">{doc.dept_name} (Floor {doc.floor_no})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Experience (v_doctor):</span>
                    <span className="font-semibold text-slate-800">{doc.experience_years} years</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Consultation Fee:</span>
                    <span className="font-bold text-slate-900 font-serif">₹{doc.consultation_fee}</span>
                  </div>
                </div>

                {/* Schedules */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Weekly Clinic Slots</span>
                  <div className="flex flex-wrap gap-1">
                    {doc.schedules?.length === 0 ? (
                      <span className="text-xs text-slate-400 italic">No schedules listed</span>
                    ) : (
                      doc.schedules?.map(s => (
                        <span
                          key={s.schedule_id}
                          className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium"
                        >
                          {s.day_of_week.slice(0, 3)}: {s.start_time.slice(0, 5)} - {s.end_time.slice(0, 5)}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1 font-mono">
                  <Phone className="w-3 h-3" /> {doc.phone}
                </span>
                <Link
                  to={`/appointments/new?doctor_id=${doc.doctor_id}`}
                  className="px-3 py-1.5 rounded-lg bg-medicore-teal hover:bg-medicore-teal-dark text-white font-semibold transition-colors"
                >
                  Book Slot
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
