import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import ErrorAlert from '../components/ErrorAlert';
import { Bed, Plus, UserMinus, Clock, MapPin, CheckCircle, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Admissions() {
  const [admissions, setAdmissions] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Admit modal
  const [showAdmitModal, setShowAdmitModal] = useState(false);
  const [admitForm, setAdmitForm] = useState({
    patient_id: '',
    room_id: '',
    doctor_id: '',
    admission_type: 'Planned',
    diagnosis: ''
  });

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      api.get('/admissions'),
      api.get('/admissions/rooms'),
      api.get('/patients'),
      api.get('/doctors')
    ])
      .then(([adms, rms, pts, docs]) => {
        setAdmissions(adms);
        setRooms(rms);
        setPatients(pts);
        setDoctors(docs);
        if (pts.length > 0 && !admitForm.patient_id) setAdmitForm(prev => ({ ...prev, patient_id: pts[0].patient_id }));
        const availableRoom = rms.find(r => r.availability === 'Available');
        if (availableRoom && !admitForm.room_id) setAdmitForm(prev => ({ ...prev, room_id: availableRoom.room_id }));
        if (docs.length > 0 && !admitForm.doctor_id) setAdmitForm(prev => ({ ...prev, doctor_id: docs[0].doctor_id }));
      })
      .catch(setError)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAdmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await api.post('/admissions', admitForm);
      setShowAdmitModal(false);
      fetchData();
    } catch (err) {
      setError(err);
    }
  };

  const handleDischarge = async (admissionId) => {
    if (!window.confirm('Are you sure you want to discharge this patient and release the room?')) return;
    setError(null);
    try {
      await api.patch(`/admissions/${admissionId}/discharge`, {});
      fetchData();
    } catch (err) {
      setError(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-serif text-slate-900">Inpatient & Bed Management</h1>
          <p className="text-xs text-slate-500 mt-1">
            Flow 4 (Admit & Discharge): Atomic state synchronization between <code>admission</code> and <code>room.availability</code>. Stay duration from <code className="text-teal-700">v_admission</code> (Q14).
          </p>
        </div>
        <button
          onClick={() => setShowAdmitModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-medicore-teal hover:bg-medicore-teal-dark text-white text-sm font-semibold shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" /> Admit Patient (Flow 4)
        </button>
      </div>

      <ErrorAlert error={error} onClose={() => setError(null)} />

      {/* Bed Board Grid */}
      <div className="bg-white p-5 rounded-xl border border-medicore-border shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-serif font-bold text-base text-slate-900 flex items-center gap-2">
            <Bed className="w-5 h-5 text-medicore-teal" /> Bed Board & Room Occupancy
          </h3>
          <div className="flex gap-3 text-xs">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Available</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Occupied</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span> Maintenance</span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {rooms.map(room => (
            <div
              key={room.room_id}
              className={`p-3 rounded-lg border text-xs transition-all ${
                room.availability === 'Available'
                  ? 'border-emerald-200 bg-emerald-50/40 text-emerald-950'
                  : room.availability === 'Occupied'
                    ? 'border-amber-200 bg-amber-50/50 text-amber-950'
                    : 'border-slate-200 bg-slate-50 text-slate-600'
              }`}
            >
              <div className="flex justify-between items-center font-bold">
                <span className="font-mono text-sm">{room.room_number}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-semibold ${
                  room.availability === 'Available' ? 'bg-emerald-100 text-emerald-800' :
                  room.availability === 'Occupied' ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-700'
                }`}>
                  {room.availability}
                </span>
              </div>
              <div className="mt-1 text-slate-600 font-medium">{room.room_type} · Floor {room.floor_no}</div>
              <div className="text-[11px] text-slate-500 mt-1 flex justify-between">
                <span>Cap: {room.bed_capacity}</span>
                <span className="font-bold font-serif">₹{room.daily_charge}/day</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Current Admissions & History Table (Q11, Q14) */}
      <div className="bg-white rounded-xl border border-medicore-border shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-serif font-bold text-base text-slate-900">
            Admissions Roster (Q11, Q14)
          </h3>
        </div>

        <div className="table-container">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs uppercase font-semibold">
                <th className="py-3 px-4">Patient</th>
                <th className="py-3 px-4">Room & Type</th>
                <th className="py-3 px-4">Doctor</th>
                <th className="py-3 px-4">Admission Date</th>
                <th className="py-3 px-4">Discharge Date</th>
                <th className="py-3 px-4">Stay Length (v_admission)</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {admissions.map(adm => (
                <tr key={adm.admission_id} className="hover:bg-slate-50/70">
                  <td className="py-3 px-4">
                    <Link to={`/patients/${adm.patient_id}`} className="font-semibold text-slate-900 hover:text-medicore-teal">
                      {adm.patient_first_name} {adm.patient_last_name}
                    </Link>
                    <div className="text-xs text-slate-400">Diagnosis: {adm.diagnosis}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-slate-800 font-mono">{adm.room_number}</span>
                    <span className="text-xs text-slate-500 ml-1">({adm.room_type})</span>
                  </td>
                  <td className="py-3 px-4 text-xs font-medium text-slate-800">
                    Dr. {adm.doctor_first_name} {adm.doctor_last_name}
                  </td>
                  <td className="py-3 px-4 text-xs font-mono text-slate-700">
                    {adm.admission_date?.slice(0, 16)}
                  </td>
                  <td className="py-3 px-4 text-xs font-mono text-slate-500">
                    {adm.discharge_date ? adm.discharge_date.slice(0, 16) : '—'}
                  </td>
                  <td className="py-3 px-4 text-xs font-bold font-mono text-teal-800">
                    {adm.length_of_stay} day{adm.length_of_stay === 1 ? '' : 's'}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                      adm.status === 'Admitted' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {adm.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    {adm.status === 'Admitted' && (
                      <button
                        onClick={() => handleDischarge(adm.admission_id)}
                        className="px-3 py-1 rounded bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-2xs"
                      >
                        Discharge & Free Room
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Admit Modal */}
      {showAdmitModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 space-y-4">
            <h3 className="font-serif font-bold text-lg text-slate-900 border-b border-slate-100 pb-2">
              Admit Patient (Transaction 4)
            </h3>
            <p className="text-xs text-slate-500">
              Inserts into <code>admission</code> and atomically marks the selected room as <code>Occupied</code>.
            </p>

            <form onSubmit={handleAdmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 uppercase mb-1">Select Patient *</label>
                <select
                  value={admitForm.patient_id}
                  onChange={(e) => setAdmitForm(p => ({ ...p, patient_id: e.target.value }))}
                  required
                  className="w-full p-2 border border-slate-200 rounded-lg bg-white"
                >
                  {patients.map(p => (
                    <option key={p.patient_id} value={p.patient_id}>
                      #{p.patient_id}: {p.first_name} {p.last_name} ({p.city})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase mb-1">Select Available Room *</label>
                <select
                  value={admitForm.room_id}
                  onChange={(e) => setAdmitForm(p => ({ ...p, room_id: e.target.value }))}
                  required
                  className="w-full p-2 border border-slate-200 rounded-lg bg-white font-mono"
                >
                  {rooms.filter(r => r.availability === 'Available').map(r => (
                    <option key={r.room_id} value={r.room_id}>
                      {r.room_number} - {r.room_type} (Floor {r.floor_no}, ₹{r.daily_charge}/day)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase mb-1">Admitting Doctor *</label>
                <select
                  value={admitForm.doctor_id}
                  onChange={(e) => setAdmitForm(p => ({ ...p, doctor_id: e.target.value }))}
                  required
                  className="w-full p-2 border border-slate-200 rounded-lg bg-white"
                >
                  {doctors.map(d => (
                    <option key={d.doctor_id} value={d.doctor_id}>
                      Dr. {d.first_name} {d.last_name} ({d.specialization})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase mb-1">Admission Type</label>
                <select
                  value={admitForm.admission_type}
                  onChange={(e) => setAdmitForm(p => ({ ...p, admission_type: e.target.value }))}
                  className="w-full p-2 border border-slate-200 rounded-lg bg-white"
                >
                  <option value="Planned">Planned</option>
                  <option value="Emergency">Emergency</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase mb-1">Diagnosis / Reason *</label>
                <input
                  type="text"
                  value={admitForm.diagnosis}
                  onChange={(e) => setAdmitForm(p => ({ ...p, diagnosis: e.target.value }))}
                  required
                  placeholder="e.g. Acute severe asthma"
                  className="w-full p-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAdmitModal(false)}
                  className="px-4 py-2 rounded border border-slate-300 text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded bg-medicore-teal hover:bg-medicore-teal-dark text-white font-bold"
                >
                  Admit Patient (Commit)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
