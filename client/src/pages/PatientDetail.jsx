import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api/client';
import ErrorAlert from '../components/ErrorAlert';
import JsonChips from '../components/JsonChips';
import {
  User,
  Phone,
  Shield,
  Calendar,
  Receipt,
  Upload,
  MapPin,
  CheckCircle,
  Clock
} from 'lucide-react';

export default function PatientDetail() {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Photo upload state
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoKey, setPhotoKey] = useState(Date.now());

  // Editable JSON medical profile
  const [allergies, setAllergies] = useState([]);
  const [chronic, setChronic] = useState([]);
  const [savingJson, setSavingJson] = useState(false);
  const [jsonSuccess, setJsonSuccess] = useState(false);

  const fetchPatient = () => {
    setLoading(true);
    api.get(`/patients/${id}`)
      .then(data => {
        setPatient(data);
        const med = typeof data.medical_profile === 'string'
          ? JSON.parse(data.medical_profile || '{}')
          : (data.medical_profile || {});
        setAllergies(med.allergies || []);
        setChronic(med.chronic || []);
      })
      .catch(setError)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPatient();
  }, [id]);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      alert('Photo file must be under 1 MB.');
      return;
    }

    const formData = new FormData();
    formData.append('photo', file);

    setUploadingPhoto(true);
    setError(null);
    try {
      await api.put(`/patients/${id}/photo`, formData);
      setPhotoKey(Date.now());
      fetchPatient();
    } catch (err) {
      setError(err);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSaveMedicalProfile = async () => {
    setSavingJson(true);
    setError(null);
    setJsonSuccess(false);
    try {
      await api.patch(`/patients/${id}/medical-profile`, {
        medical_profile: {
          allergies,
          chronic
        }
      });
      setJsonSuccess(true);
      setTimeout(() => setJsonSuccess(false), 3000);
      fetchPatient();
    } catch (err) {
      setError(err);
    } finally {
      setSavingJson(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-400">Loading patient profile...</div>;
  }

  if (!patient) {
    return <div className="p-8 text-center text-red-500">Patient not found.</div>;
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'medical_profile', label: 'Medical Profile (JSON)' },
    { id: 'contacts', label: 'Contacts & Phones' },
    { id: 'appointments', label: `Appointments (${patient.appointments?.length || 0})` },
    { id: 'bills', label: `Bills & Ledger (${patient.bills?.length || 0})` },
    { id: 'insurance', label: `Insurance (${patient.insurance?.length || 0})` }
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <ErrorAlert error={error} onClose={() => setError(null)} />

      {/* Patient Header Card */}
      <div className="bg-white rounded-xl border border-medicore-border p-6 shadow-xs flex flex-col md:flex-row gap-6 items-start">
        {/* Photo with BLOB upload trigger */}
        <div className="flex flex-col items-center">
          <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-medicore-teal/40 bg-slate-100 relative group shadow-sm">
            {patient.has_photo ? (
              <img
                key={photoKey}
                src={`/api/patients/${patient.patient_id}/photo?t=${photoKey}`}
                alt="Patient"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold text-2xl font-serif">
                {patient.first_name[0]}{patient.last_name[0]}
              </div>
            )}
            <label className="absolute inset-0 bg-black/40 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity text-[10px] font-medium">
              <Upload className="w-4 h-4 mb-0.5" />
              <span>Change</span>
              <input
                type="file"
                accept="image/jpeg,image/png"
                onChange={handlePhotoUpload}
                disabled={uploadingPhoto}
                className="hidden"
              />
            </label>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 font-mono">MySQL BLOB (max 1MB)</span>
        </div>

        {/* Info */}
        <div className="flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold font-serif text-slate-900">
              {patient.first_name} {patient.middle_name ? patient.middle_name + ' ' : ''}{patient.last_name}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
              {patient.blood_group || 'Unknown'}
            </span>
            <span className="text-xs text-slate-400 font-mono">#{patient.patient_id}</span>
          </div>

          <p className="text-sm text-slate-600">
            {patient.age} years old ({patient.gender === 'M' ? 'Male' : patient.gender === 'F' ? 'Female' : 'Other'}) · Born {patient.date_of_birth}
          </p>

          <p className="text-xs text-slate-500 flex items-center gap-1.5 pt-1">
            <MapPin className="w-3.5 h-3.5 text-medicore-teal" />
            <span>{patient.street}, {patient.city}, {patient.state} - {patient.pincode}</span>
            {patient.distance_km != null && (
              <span className="ml-2 font-mono font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                {patient.distance_km} km from hospital
              </span>
            )}
          </p>
        </div>

        <Link
          to={`/appointments/new?patient_id=${patient.patient_id}`}
          className="px-4 py-2 rounded-lg bg-medicore-teal hover:bg-medicore-teal-dark text-white text-xs font-semibold shadow-xs"
        >
          + Book Appointment
        </Link>
      </div>

      {/* Tabs Bar */}
      <div className="flex border-b border-medicore-border bg-white rounded-t-xl px-4 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`py-3 px-4 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-medicore-teal text-medicore-teal'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      <div className="bg-white rounded-b-xl border border-medicore-border p-6 shadow-xs -mt-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-xs text-slate-400 block uppercase">Registration Date</span>
                <span className="font-semibold text-slate-800">{patient.registration_date}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-xs text-slate-400 block uppercase">National ID</span>
                <span className="font-semibold text-slate-800 font-mono">{patient.national_id || 'Not specified'}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-xs text-slate-400 block uppercase">Email</span>
                <span className="font-semibold text-slate-800">{patient.email || 'None'}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-xs text-slate-400 block uppercase">GPS Coordinates</span>
                <span className="font-semibold text-slate-800 font-mono">
                  {patient.home_latitude != null ? `${patient.home_latitude}°, ${patient.home_longitude}°` : 'Unset'}
                </span>
              </div>
            </div>

            {/* Quick Allergies Chip View */}
            <div>
              <h4 className="text-xs font-semibold uppercase text-slate-600 mb-2">Recorded Allergies (JSON J1)</h4>
              <div className="flex flex-wrap gap-2">
                {allergies.length === 0 ? (
                  <span className="text-xs text-slate-400 italic">No allergies recorded</span>
                ) : (
                  allergies.map(a => (
                    <span key={a} className="px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
                      {a}
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab: Medical Profile (JSON) */}
        {activeTab === 'medical_profile' && (
          <div className="space-y-6">
            <div className="p-4 bg-teal-50/50 border border-teal-200 rounded-lg text-xs text-teal-900">
              <span className="font-bold">MySQL JSON Demonstration:</span> This tab directly views and mutates the JSON document stored in <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-teal-200">patient.medical_profile</code>. Search by allergy executes query <code className="font-bold font-mono">J1 (JSON_CONTAINS)</code>.
            </div>

            {jsonSuccess && (
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                Medical profile successfully updated in MySQL JSON column!
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <JsonChips
                label="Allergies (JSON array)"
                items={allergies}
                color="coral"
                onAdd={(a) => setAllergies(prev => [...prev, a])}
                onRemove={(a) => setAllergies(prev => prev.filter(x => x !== a))}
              />

              <JsonChips
                label="Chronic Conditions (JSON array)"
                items={chronic}
                color="teal"
                onAdd={(c) => setChronic(prev => [...prev, c])}
                onRemove={(c) => setChronic(prev => prev.filter(x => x !== c))}
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={handleSaveMedicalProfile}
                disabled={savingJson}
                className="px-5 py-2 rounded-lg bg-medicore-teal hover:bg-medicore-teal-dark text-white text-xs font-bold transition-colors disabled:opacity-50"
              >
                {savingJson ? 'Saving JSON...' : 'Save Medical Profile (UPDATE JSON)'}
              </button>
            </div>
          </div>
        )}

        {/* Tab: Contacts & Phones */}
        {activeTab === 'contacts' && (
          <div className="space-y-6">
            <div>
              <h4 className="font-serif font-bold text-sm text-slate-800 mb-2">
                Phone Numbers (Multivalued Attribute Table: <code>patient_phone</code> - Q6)
              </h4>
              <div className="flex flex-wrap gap-2">
                {patient.phones?.map(p => (
                  <span key={p} className="px-3 py-1 bg-slate-100 rounded-lg text-xs font-mono font-semibold text-slate-800 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-500" /> {p}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-serif font-bold text-sm text-slate-800 mb-2">
                Emergency Contacts (Weak Entity Table: <code>emergency_contact</code> - Q7)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {patient.emergency_contacts?.map(ec => (
                  <div key={ec.contact_name} className="p-3 rounded-lg border border-slate-200 bg-slate-50/60">
                    <div className="font-semibold text-slate-800 text-sm">{ec.contact_name}</div>
                    <div className="text-xs text-medicore-teal font-medium">{ec.relation_to_patient}</div>
                    <div className="text-xs text-slate-600 font-mono mt-1">Phone: {ec.phone}</div>
                    {ec.alt_phone && (
                      <div className="text-xs text-slate-400 font-mono">Alt: {ec.alt_phone}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab: Appointments */}
        {activeTab === 'appointments' && (
          <div className="space-y-3">
            {patient.appointments?.length === 0 ? (
              <div className="text-slate-400 text-sm italic py-4">No appointments recorded yet.</div>
            ) : (
              patient.appointments?.map(app => (
                <div key={app.appointment_id} className="p-4 rounded-lg border border-slate-200 hover:border-medicore-teal transition-colors flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 text-sm">
                        Dr. {app.doctor_first_name} {app.doctor_last_name} ({app.dept_name})
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded font-medium bg-slate-100 text-slate-700">
                        {app.status}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      {app.appointment_date} at {app.appointment_time} · Reason: {app.reason}
                    </div>
                  </div>
                  <Link
                    to={`/appointments/${app.appointment_id}`}
                    className="px-3 py-1.5 rounded text-xs font-semibold bg-slate-100 hover:bg-medicore-teal hover:text-white transition-colors"
                  >
                    Details & Prescriptions
                  </Link>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab: Bills */}
        {activeTab === 'bills' && (
          <div className="space-y-3">
            {patient.bills?.length === 0 ? (
              <div className="text-slate-400 text-sm italic py-4">No bills recorded.</div>
            ) : (
              patient.bills?.map(bill => (
                <div key={bill.bill_id} className="p-4 rounded-lg border border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 font-mono">Bill #{bill.bill_id}</span>
                      <span className="text-xs px-2 py-0.5 rounded font-bold uppercase bg-slate-100">
                        {bill.bill_type}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded font-semibold ${
                        bill.payment_status === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {bill.payment_status}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1">Date: {bill.bill_date}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-slate-900 font-serif">₹{bill.total_amount}</div>
                    <div className="text-xs text-slate-500">
                      Paid: ₹{bill.amount_paid} · <span className="text-red-600 font-semibold">Due: ₹{bill.balance_due}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab: Insurance */}
        {activeTab === 'insurance' && (
          <div className="space-y-3">
            {patient.insurance?.length === 0 ? (
              <div className="text-slate-400 text-sm italic py-4">No insurance policies active.</div>
            ) : (
              patient.insurance?.map(ins => (
                <div key={ins.provider_id} className="p-4 rounded-lg border border-slate-200 bg-slate-50/50">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-bold text-slate-900 text-sm">{ins.provider_name}</div>
                      <div className="text-xs text-medicore-teal font-semibold">{ins.plan_name}</div>
                      <div className="text-xs text-slate-500 font-mono mt-1">Policy: {ins.policy_number}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-slate-400 uppercase">Coverage Limit</div>
                      <div className="text-base font-bold text-emerald-700 font-serif">
                        ₹{Number(ins.coverage_limit).toLocaleString()}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">Valid: {ins.valid_from} to {ins.valid_to}</div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
