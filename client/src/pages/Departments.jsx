import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { Building2, Stethoscope, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Departments() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/doctors/departments/list')
      .then(setDepartments)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-serif text-slate-900">Hospital Departments</h1>
        <p className="text-xs text-slate-500 mt-1">
          Query Q3: Department directory with appointed head doctors and floor locations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-12 text-slate-400">Loading departments...</div>
        ) : (
          departments.map(dept => (
            <div
              key={dept.dept_id}
              className="bg-white rounded-xl border border-medicore-border p-5 shadow-xs hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-serif font-bold text-lg text-slate-900 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-medicore-teal" /> {dept.dept_name}
                  </h3>
                  <span className="text-xs text-slate-500 mt-0.5 block">
                    Floor {dept.floor_no} · Ext: {dept.phone_ext || '—'}
                  </span>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                  {dept.total_doctors} Doctor{dept.total_doctors === 1 ? '' : 's'}
                </span>
              </div>

              <div className="mt-4 p-3 bg-slate-50 rounded-lg text-xs space-y-1">
                <div className="text-slate-400 font-semibold uppercase text-[10px]">Head of Department (Q3)</div>
                {dept.head_doctor_id ? (
                  <div>
                    <span className="font-bold text-slate-800">
                      Dr. {dept.head_first_name} {dept.head_last_name}
                    </span>
                    <span className="text-slate-500 block">{dept.head_specialization}</span>
                  </div>
                ) : (
                  <span className="text-slate-400 italic">No head doctor assigned</span>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
                <Link
                  to={`/doctors?dept_id=${dept.dept_id}`}
                  className="text-xs font-semibold text-medicore-teal hover:underline flex items-center gap-1"
                >
                  <Stethoscope className="w-3.5 h-3.5" /> View Doctors
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
