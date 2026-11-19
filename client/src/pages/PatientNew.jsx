import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import ErrorAlert from '../components/ErrorAlert';
import JsonChips from '../components/JsonChips';
import { UserPlus, Plus, Trash2, ArrowLeft, MapPin } from 'lucide-react';

export default function PatientNew() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    first_name: '',
    middle_name: '',
    last_name: '',
    date_of_birth: '',
    gender: 'M',
    blood_group: 'B+',
    email: '',
    street: '',
    city: 'Jaipur',
    state: 'Rajasthan',
    pincode: '302001',
    registration_date: new Date().toISOString().slice(0, 10),
    national_id: '',
    home_latitude: 26.9150,
    home_longitude: 75.8000
  });

  const [phones, setPhones] = useState(['']);
  const [emergencyContacts, setEmergencyContacts] = useState([
    { contact_name: '', relation_to_patient: 'Family', phone: '', alt_phone: '' }
  ]);
  const [allergies, setAllergies] = useState([]);
  const [chronicConditions, setChronicConditions] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handlePhoneChange = (idx, val) => {
    const copy = [...phones];
    copy[idx] = val;
    setPhones(copy);
  };

  const addPhone = () => setPhones(prev => [...prev, '']);
  const removePhone = (idx) => setPhones(prev => prev.filter((_, i) => i !== idx));

  const handleContactChange = (idx, field, val) => {
    const copy = [...emergencyContacts];
    copy[idx][field] = val;
    setEmergencyContacts(copy);
  };

  const addContact = () => setEmergencyContacts(prev => [...prev, { contact_name: '', relation_to_patient: 'Family', phone: '', alt_phone: '' }]);
  const removeContact = (idx) => setEmergencyContacts(prev => prev.filter((_, i) => i !== idx));

  const setLocationPreset = (lat, lng, name) => {
    setForm(prev => ({ ...prev, home_latitude: lat, home_longitude: lng }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      ...form,
      home_latitude: form.home_latitude !== '' ? parseFloat(form.home_latitude) : null,
      home_longitude: form.home_longitude !== '' ? parseFloat(form.home_longitude) : null,
      phones: phones.filter(p => p.trim() !== ''),
      emergency_contacts: emergencyContacts.filter(c => c.contact_name && c.phone),
      medical_profile: {
        allergies,
        chronic: chronicConditions
      }
    };

    try {
      const res = await api.post('/patients', payload);
      navigate(`/patients/${res.patient_id}`);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/patients')}
          className="p-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-2xl font-bold font-serif text-slate-900">Register New Patient</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Atomic Transaction 1: Inserts patient, phone numbers, and emergency contacts in one unit of work.
          </p>
        </div>
      </div>

      <ErrorAlert error={error} onClose={() => setError(null)} />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Details */}
        <div className="bg-white p-6 rounded-xl border border-medicore-border shadow-xs space-y-4">
          <h3 className="font-serif font-bold text-base text-slate-900 border-b border-slate-100 pb-2">
            1. Personal Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">First Name *</label>
              <input
                type="text"
                name="first_name"
                value={form.first_name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-medicore-teal"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Middle Name</label>
              <input
                type="text"
                name="middle_name"
                value={form.middle_name}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-medicore-teal"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Last Name *</label>
              <input
                type="text"
                name="last_name"
                value={form.last_name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-medicore-teal"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Date of Birth *</label>
              <input
                type="date"
                name="date_of_birth"
                value={form.date_of_birth}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-medicore-teal"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Gender *</label>
              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white"
              >
                <option value="M">Male (M)</option>
                <option value="F">Female (F)</option>
                <option value="O">Other (O)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Blood Group</label>
              <select
                name="blood_group"
                value={form.blood_group}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white"
              >
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">National ID</label>
              <input
                type="text"
                name="national_id"
                value={form.national_id}
                onChange={handleChange}
                placeholder="e.g. ID1050"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-medicore-teal"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Email Address</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="patient@domain.com"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-medicore-teal"
            />
          </div>
        </div>

        {/* Address & GPS Coordinates */}
        <div className="bg-white p-6 rounded-xl border border-medicore-border shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="font-serif font-bold text-base text-slate-900">
              2. Address & Home GPS Coordinates
            </h3>
            <span className="text-xs text-medicore-teal font-mono">Jaipur Base: 26.9124° N, 75.7873° E</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Street Address *</label>
              <input
                type="text"
                name="street"
                value={form.street}
                onChange={handleChange}
                required
                placeholder="House / Flat / Street Name"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-medicore-teal"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">City *</label>
              <input
                type="text"
                name="city"
                value={form.city}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-medicore-teal"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">State *</label>
              <input
                type="text"
                name="state"
                value={form.state}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-medicore-teal"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Pincode (6 digits) *</label>
              <input
                type="text"
                name="pincode"
                value={form.pincode}
                onChange={handleChange}
                maxLength="6"
                required
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-medicore-teal font-mono"
              />
            </div>
          </div>

          {/* GPS Coordinates with CHECK constraint alert */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
            <div className="text-xs font-semibold text-slate-700 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-800">
                <MapPin className="w-4 h-4 text-medicore-teal" /> Home Coordinates (Used for G1, G2 queries)
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setLocationPreset(26.9150, 75.8000, 'MI Road')}
                  className="text-[11px] px-2 py-0.5 rounded bg-white border border-slate-200 hover:border-medicore-teal"
                >
                  MI Road (1.3 km)
                </button>
                <button
                  type="button"
                  onClick={() => setLocationPreset(26.8500, 75.8100, 'Tonk Road')}
                  className="text-[11px] px-2 py-0.5 rounded bg-white border border-slate-200 hover:border-medicore-teal"
                >
                  Tonk Rd (7.3 km)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">
                  Latitude (CHECK: -90 to 90)
                </label>
                <input
                  type="number"
                  step="any"
                  name="home_latitude"
                  value={form.home_latitude}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-medicore-teal font-mono bg-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">
                  Longitude (CHECK: -180 to 180)
                </label>
                <input
                  type="number"
                  step="any"
                  name="home_longitude"
                  value={form.home_longitude}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-medicore-teal font-mono bg-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Multivalued Phones & Emergency Contacts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Phones */}
          <div className="bg-white p-6 rounded-xl border border-medicore-border shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-serif font-bold text-base text-slate-900">
                3. Phone Numbers
              </h3>
              <button
                type="button"
                onClick={addPhone}
                className="text-xs text-medicore-teal hover:underline flex items-center gap-1 font-semibold"
              >
                <Plus className="w-3.5 h-3.5" /> Add Number
              </button>
            </div>
            <p className="text-[11px] text-slate-500">Multivalued attribute table: <code>patient_phone</code></p>

            {phones.map((phone, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => handlePhoneChange(idx, e.target.value)}
                  placeholder="e.g. 9811100001"
                  className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg font-mono"
                />
                {phones.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removePhone(idx)}
                    className="p-2 text-slate-400 hover:text-red-600 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Emergency Contacts */}
          <div className="bg-white p-6 rounded-xl border border-medicore-border shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-serif font-bold text-base text-slate-900">
                4. Emergency Contacts
              </h3>
              <button
                type="button"
                onClick={addContact}
                className="text-xs text-medicore-teal hover:underline flex items-center gap-1 font-semibold"
              >
                <Plus className="w-3.5 h-3.5" /> Add Contact
              </button>
            </div>
            <p className="text-[11px] text-slate-500">Weak entity table: <code>emergency_contact</code></p>

            {emergencyContacts.map((contact, idx) => (
              <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={contact.contact_name}
                    onChange={(e) => handleContactChange(idx, 'contact_name', e.target.value)}
                    placeholder="Contact Name"
                    className="flex-1 px-2.5 py-1.5 text-xs border border-slate-200 rounded bg-white"
                  />
                  <input
                    type="text"
                    value={contact.relation_to_patient}
                    onChange={(e) => handleContactChange(idx, 'relation_to_patient', e.target.value)}
                    placeholder="Relation (e.g. Spouse)"
                    className="w-28 px-2.5 py-1.5 text-xs border border-slate-200 rounded bg-white"
                  />
                  {emergencyContacts.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeContact(idx)}
                      className="p-1.5 text-slate-400 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={contact.phone}
                    onChange={(e) => handleContactChange(idx, 'phone', e.target.value)}
                    placeholder="Phone number"
                    className="flex-1 px-2.5 py-1.5 text-xs border border-slate-200 rounded bg-white font-mono"
                  />
                  <input
                    type="text"
                    value={contact.alt_phone}
                    onChange={(e) => handleContactChange(idx, 'alt_phone', e.target.value)}
                    placeholder="Alt phone (optional)"
                    className="flex-1 px-2.5 py-1.5 text-xs border border-slate-200 rounded bg-white font-mono"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Medical Profile (JSON column) */}
        <div className="bg-white p-6 rounded-xl border border-medicore-border shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-2">
            <h3 className="font-serif font-bold text-base text-slate-900">
              5. Medical Profile (JSON column: <code>patient.medical_profile</code>)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Stores flexible arrays for allergies and chronic conditions directly in MySQL JSON format.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <JsonChips
              label="Allergies (e.g. Penicillin, Dust, Latex)"
              items={allergies}
              color="coral"
              onAdd={(a) => setAllergies(prev => [...prev, a])}
              onRemove={(a) => setAllergies(prev => prev.filter(x => x !== a))}
            />
            <JsonChips
              label="Chronic Conditions (e.g. Diabetes, Hypertension)"
              items={chronicConditions}
              color="teal"
              onAdd={(c) => setChronicConditions(prev => [...prev, c])}
              onRemove={(c) => setChronicConditions(prev => prev.filter(x => x !== c))}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/patients')}
            className="px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-sm font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 rounded-lg bg-medicore-teal hover:bg-medicore-teal-dark text-white text-sm font-bold shadow-md transition-colors disabled:opacity-50"
          >
            {loading ? 'Executing Transaction...' : 'Register Patient (Begin & Commit)'}
          </button>
        </div>
      </form>
    </div>
  );
}
