import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { Search, UserPlus, Filter, MapPin, Eye, AlertTriangle } from 'lucide-react';

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');
  const [allergy, setAllergy] = useState('');
  const [withinKm, setWithinKm] = useState('');
  const [sortByDistance, setSortByDistance] = useState(false);

  const fetchPatients = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (city) params.append('city', city);
    if (allergy) params.append('allergy', allergy);
    if (withinKm) params.append('withinKm', withinKm);
    if (sortByDistance) params.append('sortByDistance', 'true');

    api.get(`/patients?${params.toString()}`)
      .then(setPatients)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPatients();
  }, [city, allergy, withinKm, sortByDistance]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchPatients();
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-serif text-slate-900">Patient Directory</h1>
          <p className="text-xs text-slate-500 mt-1">
            Displaying age via <code className="text-teal-700">v_patient</code> view, JSON allergies, and GPS proximity.
          </p>
        </div>
        <Link
          to="/patients/new"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-medicore-teal hover:bg-medicore-teal-dark text-white text-sm font-semibold shadow-xs transition-colors"
        >
          <UserPlus className="w-4 h-4" /> Register New Patient
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-medicore-border shadow-xs space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by patient name or National ID..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-medicore-teal"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium rounded-lg"
          >
            Search
          </button>
        </form>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100 text-xs">
          {/* City Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">City</label>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full p-2 border border-slate-200 rounded-lg bg-white"
            >
              <option value="">All Cities</option>
              <option value="Jaipur">Jaipur</option>
              <option value="Gurugram">Gurugram</option>
              <option value="Delhi">Delhi</option>
            </select>
          </div>

          {/* J1: Allergy Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">
              Allergy Filter (JSON J1)
            </label>
            <select
              value={allergy}
              onChange={(e) => setAllergy(e.target.value)}
              className="w-full p-2 border border-slate-200 rounded-lg bg-white text-teal-800 font-medium"
            >
              <option value="">Any Allergy</option>
              <option value="Penicillin">Allergic to Penicillin (J1)</option>
              <option value="Aspirin">Allergic to Aspirin</option>
              <option value="Dust">Allergic to Dust</option>
              <option value="Peanuts">Allergic to Peanuts</option>
              <option value="Latex">Allergic to Latex</option>
            </select>
          </div>

          {/* G2: Radius Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">
              Radius from Hospital (GPS G2)
            </label>
            <select
              value={withinKm}
              onChange={(e) => setWithinKm(e.target.value)}
              className="w-full p-2 border border-slate-200 rounded-lg bg-white"
            >
              <option value="">Any Distance</option>
              <option value="5">Within 5 km (G2)</option>
              <option value="10">Within 10 km</option>
              <option value="25">Within 25 km</option>
            </select>
          </div>

          {/* G1: Sort by Distance */}
          <div className="flex items-end pb-1">
            <label className="flex items-center gap-2 cursor-pointer text-slate-700">
              <input
                type="checkbox"
                checked={sortByDistance}
                onChange={(e) => setSortByDistance(e.target.checked)}
                className="rounded border-slate-300 text-medicore-teal focus:ring-medicore-teal"
              />
              <span className="font-semibold text-xs">Sort by Proximity (G1)</span>
            </label>
          </div>
        </div>
      </div>

      {/* Patient Table */}
      <div className="bg-white rounded-xl border border-medicore-border shadow-xs overflow-hidden">
        <div className="table-container">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs uppercase font-semibold">
                <th className="py-3 px-4">Photo</th>
                <th className="py-3 px-4">Patient ID & Name</th>
                <th className="py-3 px-4">Age / Gender</th>
                <th className="py-3 px-4">Blood Group</th>
                <th className="py-3 px-4">City & Distance (GPS)</th>
                <th className="py-3 px-4">Allergies (JSON)</th>
                <th className="py-3 px-4">Phone(s)</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400">Loading patients...</td>
                </tr>
              ) : patients.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400 italic">No matching patients found.</td>
                </tr>
              ) : (
                patients.map(p => {
                  const med = typeof p.medical_profile === 'string'
                    ? JSON.parse(p.medical_profile || '{}')
                    : (p.medical_profile || {});
                  const allergies = med.allergies || [];

                  return (
                    <tr key={p.patient_id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        {p.has_photo ? (
                          <img
                            src={`/api/patients/${p.patient_id}/photo`}
                            alt="Photo"
                            className="w-9 h-9 rounded-full object-cover border border-slate-300 shadow-2xs"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-xs font-semibold border border-slate-200">
                            {p.first_name[0]}{p.last_name[0]}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <Link
                          to={`/patients/${p.patient_id}`}
                          className="font-semibold text-slate-900 hover:text-medicore-teal transition-colors"
                        >
                          {p.first_name} {p.middle_name ? p.middle_name + ' ' : ''}{p.last_name}
                        </Link>
                        <div className="text-xs text-slate-400 font-mono">ID: #{p.patient_id} · {p.national_id || 'No ID'}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium text-slate-800">{p.age} yrs</span>
                        <span className="text-slate-400 text-xs ml-1.5">({p.gender})</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-xs font-bold bg-slate-100 text-slate-700">
                          {p.blood_group || '—'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-slate-800 font-medium">{p.city}</div>
                        {p.distance_km != null && (
                          <div className="text-xs text-teal-700 flex items-center gap-1 font-mono">
                            <MapPin className="w-3 h-3" /> {p.distance_km} km
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {allergies.length === 0 ? (
                          <span className="text-xs text-slate-400 italic">None</span>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {allergies.map(a => (
                              <span
                                key={a}
                                className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                                  a === allergy ? 'bg-teal-600 text-white font-bold' : 'bg-red-50 text-red-700 border border-red-200'
                                }`}
                              >
                                {a}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-xs font-mono text-slate-600">
                        {p.phones && p.phones.length > 0 ? p.phones.join(', ') : '—'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          to={`/patients/${p.patient_id}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded bg-slate-100 hover:bg-medicore-teal hover:text-white text-slate-700 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" /> View
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
