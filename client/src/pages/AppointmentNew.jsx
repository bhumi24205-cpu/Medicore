import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../api/client';
import ErrorAlert from '../components/ErrorAlert';
import { CalendarPlus, Clock, ArrowLeft, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function AppointmentNew() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loadingInitial, setLoadingInitial] = useState(true);

  const [patientId, setPatientId] = useState(searchParams.get('patient_id') || '');
  const [doctorId, setDoctorId] = useState(searchParams.get('doctor_id') || '');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [selectedSlot, setSelectedSlot] = useState('');
  const [appointmentType, setAppointmentType] = useState('New');
  const [reason, setReason] = useState('Routine consultation');
  const [notes, setNotes] = useState('');

  // Slots fetched from doctor schedule
  const [slotsData, setSlotsData] = useState(null);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([
      api.get('/patients'),
      api.get('/doctors')
    ])
      .then(([pList, dList]) => {
        setPatients(pList);
        setDoctors(dList);
        if (!patientId && pList.length > 0) setPatientId(String(pList[0].patient_id));
        if (!doctorId && dList.length > 0) setDoctorId(String(dList[0].doctor_id));
      })
      .catch(console.error)
      .finally(() => setLoadingInitial(false));
  }, []);

  // Fetch slots whenever doctor or date changes
  useEffect(() => {
    if (!doctorId || !date) return;
    setLoadingSlots(true);
    setError(null);
    setSelectedSlot('');
    api.get(`/doctors/${doctorId}/slots?date=${date}`)
      .then(res => {
        setSlotsData(res);
        // Pre-select first available slot if any
        const firstAvail = res.slots?.find(s => s.available);
        if (firstAvail) setSelectedSlot(firstAvail.time);
      })
      .catch(setError)
      .finally(() => setLoadingSlots(false));
  }, [doctorId, date]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSlot) {
      alert('Please select an appointment slot time.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // NOTE: Flow 2 - Direct insert without pre-checking to prevent race conditions.
      // Database UNIQUE(doctor_id, appointment_date, appointment_time) throws 1062 if collided.
      const res = await api.post('/appointments', {
        patient_id: parseInt(patientId, 10),
        doctor_id: parseInt(doctorId, 10),
        appointment_date: date,
        appointment_time: selectedSlot,
        appointment_type: appointmentType,
        reason,
        notes
      });

      navigate(`/appointments/${res.appointment_id}`);
    } catch (err) {
      setError(err);
    } finally {
      setSubmitting(false);
    }
  };

  const selectedDoctorObj = doctors.find(d => String(d.doctor_id) === String(doctorId));

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/appointments')}
          className="p-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-2xl font-bold font-serif text-slate-900">Book Appointment</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Demonstrates Flow 2: Relies on MySQL constraint <code className="text-teal-700">UNIQUE(doctor_id, date, time)</code>. Error 1062 is translated by errorMapper.
          </p>
        </div>
      </div>

      <ErrorAlert error={error} onClose={() => setError(null)} />

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-medicore-border p-6 shadow-xs space-y-5">
        {/* Patient Selection */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            1. Select Patient
          </label>
          <select
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
            required
            className="w-full p-2.5 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-medicore-teal font-medium"
          >
            {patients.map(p => (
              <option key={p.patient_id} value={p.patient_id}>
                #{p.patient_id}: {p.first_name} {p.last_name} ({p.gender}, {p.age} yrs) - {p.city}
              </option>
            ))}
          </select>
        </div>

        {/* Doctor Selection */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            2. Select Doctor & Specialty
          </label>
          <select
            value={doctorId}
            onChange={(e) => setDoctorId(e.target.value)}
            required
            className="w-full p-2.5 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-medicore-teal font-medium"
          >
            {doctors.map(d => (
              <option key={d.doctor_id} value={d.doctor_id}>
                Dr. {d.first_name} {d.last_name} — {d.specialization} ({d.dept_name}) · Fee: ₹{d.consultation_fee}
              </option>
            ))}
          </select>
        </div>

        {/* Date Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              3. Appointment Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full p-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-medicore-teal"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Appointment Type
            </label>
            <select
              value={appointmentType}
              onChange={(e) => setAppointmentType(e.target.value)}
              className="w-full p-2.5 text-sm border border-slate-200 rounded-lg bg-white"
            >
              <option value="New">New Consultation</option>
              <option value="Follow-up">Follow-up</option>
              <option value="Emergency">Emergency</option>
            </select>
          </div>
        </div>

        {/* Computed Available Slots */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
            <span>4. Choose Time Slot (Computed Availability)</span>
            {slotsData && (
              <span className="text-[11px] font-normal text-slate-500 font-mono">
                {slotsData.day_of_week} ({slotsData.schedule ? `${slotsData.schedule.slot_duration_min} min slots` : 'No clinic'})
              </span>
            )}
          </label>

          {loadingSlots ? (
            <div className="p-4 text-center text-xs text-slate-400">Loading doctor clinic slots...</div>
          ) : !slotsData?.available ? (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs">
              {slotsData?.message || 'Doctor is not available on this date. Please choose another date.'}
            </div>
          ) : (
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {slotsData.slots?.map(slot => (
                <button
                  key={slot.time}
                  type="button"
                  onClick={() => setSelectedSlot(slot.time)}
                  className={`p-2 rounded-lg text-xs font-mono font-bold transition-all border ${
                    selectedSlot === slot.time
                      ? 'bg-medicore-teal text-white border-medicore-teal shadow-xs'
                      : slot.available
                        ? 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
                        : 'bg-red-50 text-red-400 border-red-200 hover:bg-red-100 hover:text-red-700'
                  }`}
                  title={!slot.available ? 'Slot booked (Click to test double-booking error 1062!)' : 'Slot available'}
                >
                  {slot.time}
                  {!slot.available && (
                    <span className="block text-[8px] font-normal uppercase text-red-500">Booked</span>
                  )}
                </button>
              ))}
            </div>
          )}
          <p className="text-[11px] text-slate-400 mt-1 italic">
            Tip: You can intentionally click a "Booked" red slot to test MySQL error 1062 mapping!
          </p>
        </div>

        {/* Reason and Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Reason for Visit *
          </label>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
            placeholder="e.g. Follow-up for chest discomfort"
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-medicore-teal"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Clinical Notes (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows="2"
            placeholder="Notes for the doctor..."
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-medicore-teal"
          />
        </div>

        <div className="pt-2 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/appointments')}
            className="px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 text-sm font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting || !selectedSlot}
            className="px-6 py-2.5 rounded-lg bg-medicore-teal hover:bg-medicore-teal-dark text-white text-sm font-bold shadow-md transition-colors disabled:opacity-50"
          >
            {submitting ? 'Booking...' : 'Confirm Appointment'}
          </button>
        </div>
      </form>
    </div>
  );
}
