import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import ErrorAlert from '../components/ErrorAlert';
import {
  FileText,
  Pill,
  FlaskConical,
  Receipt,
  Plus,
  Trash2,
  CheckCircle,
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Stethoscope
} from 'lucide-react';

export default function AppointmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Available medicines catalogue for prescription builder
  const [medicinesCatalogue, setMedicinesCatalogue] = useState([]);
  const [labTestsCatalogue, setLabTestsCatalogue] = useState([]);

  // Prescription builder state (Transaction 3)
  const [showPrescriptionForm, setShowPrescriptionForm] = useState(false);
  const [diagnosis, setDiagnosis] = useState('');
  const [advice, setAdvice] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [prescItems, setPrescItems] = useState([
    { medicine_id: 1, dosage: '1 tablet', frequency: 'Once daily', duration_days: 7, quantity: 7, instructions: 'After meals' }
  ]);
  const [savingPrescription, setSavingPrescription] = useState(false);

  // Lab orders builder state
  const [showLabForm, setShowLabForm] = useState(false);
  const [selectedLabTests, setSelectedLabTests] = useState([]);
  const [labPriority, setLabPriority] = useState('Routine');
  const [savingLabOrder, setSavingLabOrder] = useState(false);

  const fetchAppointment = () => {
    setLoading(true);
    api.get(`/appointments/${id}`)
      .then(setAppointment)
      .catch(setError)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAppointment();
    api.get('/clinical/medicines').then(setMedicinesCatalogue).catch(console.error);
    api.get('/clinical/lab-tests').then(setLabTestsCatalogue).catch(console.error);
  }, [id]);

  // Handle Prescription Medicines Builder
  const handleItemChange = (idx, field, val) => {
    const copy = [...prescItems];
    copy[idx][field] = val;
    setPrescItems(copy);
  };

  const addPrescItem = () => {
    const firstMed = medicinesCatalogue[0]?.medicine_id || 1;
    setPrescItems(prev => [...prev, { medicine_id: firstMed, dosage: '1 tablet', frequency: 'Twice daily', duration_days: 5, quantity: 10, instructions: '' }]);
  };

  const removePrescItem = (idx) => {
    setPrescItems(prev => prev.filter((_, i) => i !== idx));
  };

  const handleCreatePrescription = async (e) => {
    e.preventDefault();
    setSavingPrescription(true);
    setError(null);

    try {
      // Transaction 3: Insert prescription + items + decrement medicine stock
      await api.post(`/appointments/${id}/prescription`, {
        diagnosis,
        advice,
        follow_up_date: followUpDate || null,
        medicines: prescItems.map(item => ({
          ...item,
          medicine_id: parseInt(item.medicine_id, 10),
          duration_days: parseInt(item.duration_days, 10),
          quantity: parseInt(item.quantity, 10)
        }))
      });

      setShowPrescriptionForm(false);
      fetchAppointment();
    } catch (err) {
      setError(err);
    } finally {
      setSavingPrescription(false);
    }
  };

  const handleCreateLabOrder = async (e) => {
    e.preventDefault();
    if (selectedLabTests.length === 0) {
      alert('Please select at least one lab test.');
      return;
    }

    setSavingLabOrder(true);
    setError(null);

    try {
      await api.post(`/appointments/${id}/lab-orders`, {
        priority: labPriority,
        test_ids: selectedLabTests
      });
      setShowLabForm(false);
      fetchAppointment();
    } catch (err) {
      setError(err);
    } finally {
      setSavingLabOrder(false);
    }
  };

  const handleCreateBill = async () => {
    if (!appointment) return;
    setError(null);
    try {
      const items = [
        {
          item_type: 'Consultation',
          description: `${appointment.dept_name} Consultation - Dr. ${appointment.doctor_first_name} ${appointment.doctor_last_name}`,
          quantity: 1,
          unit_price: parseFloat(appointment.consultation_fee)
        }
      ];

      // Add medicines from prescription if present
      if (appointment.prescription?.medicines) {
        for (const m of appointment.prescription.medicines) {
          items.push({
            item_type: 'Medicine',
            description: `${m.medicine_name} (${m.strength})`,
            quantity: m.quantity,
            unit_price: 15.00 // standard unit price
          });
        }
      }

      await api.post('/bills', {
        patient_id: appointment.patient_id,
        appointment_id: appointment.appointment_id,
        bill_type: 'OPD',
        items
      });

      fetchAppointment();
    } catch (err) {
      setError(err);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-400">Loading appointment records...</div>;
  if (!appointment) return <div className="p-8 text-center text-red-500">Appointment not found.</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/appointments')}
          className="p-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-2xl font-bold font-serif text-slate-900">
            Appointment #{appointment.appointment_id} Clinical Record
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Prescription creation, medicine stock depletion (Transaction 3), and laboratory orders.
          </p>
        </div>
      </div>

      <ErrorAlert error={error} onClose={() => setError(null)} />

      {/* Appointment Overview Summary Card */}
      <div className="bg-white rounded-xl border border-medicore-border p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <span className="text-xs font-semibold uppercase text-slate-400">Patient</span>
            <div className="text-lg font-bold text-slate-900 font-serif">
              <Link to={`/patients/${appointment.patient_id}`} className="hover:text-medicore-teal">
                {appointment.patient_first_name} {appointment.patient_last_name}
              </Link>
            </div>
            <span className="text-xs text-slate-500">Gender: {appointment.patient_gender} · DOB: {appointment.date_of_birth}</span>
          </div>

          <div>
            <span className="text-xs font-semibold uppercase text-slate-400">Doctor</span>
            <div className="text-lg font-bold text-slate-900 font-serif">
              Dr. {appointment.doctor_first_name} {appointment.doctor_last_name}
            </div>
            <span className="text-xs text-medicore-teal font-semibold">{appointment.specialization} ({appointment.dept_name})</span>
          </div>

          <div className="text-right">
            <span className="text-xs font-semibold uppercase text-slate-400">Schedule</span>
            <div className="text-sm font-bold text-slate-900 font-mono">
              {appointment.appointment_date} at {appointment.appointment_time.slice(0, 5)}
            </div>
            <span className={`inline-block mt-1 text-xs px-2.5 py-0.5 rounded-full font-semibold ${
              appointment.status === 'Completed' ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'
            }`}>
              {appointment.status}
            </span>
          </div>
        </div>

        <div className="mt-4 text-xs text-slate-600">
          <span className="font-semibold text-slate-700">Reason for visit:</span> {appointment.reason}
          {appointment.notes && <p className="mt-1 text-slate-500">Notes: {appointment.notes}</p>}
        </div>
      </div>

      {/* Section 1: Prescription */}
      <div className="bg-white rounded-xl border border-medicore-border p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Pill className="w-5 h-5 text-medicore-teal" />
            <h3 className="font-serif font-bold text-lg text-slate-900">Prescription (Q8)</h3>
          </div>
          {!appointment.prescription && !showPrescriptionForm && (
            <button
              onClick={() => setShowPrescriptionForm(true)}
              className="px-3.5 py-1.5 rounded-lg bg-medicore-teal hover:bg-medicore-teal-dark text-white text-xs font-semibold flex items-center gap-1 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" /> Write Prescription
            </button>
          )}
        </div>

        {appointment.prescription ? (
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-lg space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Diagnosis:</span>
                <span className="font-bold text-slate-800 text-sm">{appointment.prescription.diagnosis}</span>
              </div>
              {appointment.prescription.advice && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Clinical Advice:</span>
                  <span className="font-medium text-slate-700">{appointment.prescription.advice}</span>
                </div>
              )}
              {appointment.prescription.follow_up_date && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Follow-up Date:</span>
                  <span className="font-semibold text-teal-700 font-mono">{appointment.prescription.follow_up_date}</span>
                </div>
              )}
            </div>

            {/* Prescribed Medicines (Q8) */}
            <div>
              <h4 className="text-xs font-semibold uppercase text-slate-500 mb-2">Prescribed Medicines</h4>
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden">
                {appointment.prescription.medicines?.map(m => (
                  <div key={m.medicine_id} className="p-3 bg-white flex justify-between items-center text-xs">
                    <div>
                      <div className="font-bold text-slate-800">{m.medicine_name} ({m.strength})</div>
                      <div className="text-slate-500">{m.dosage} · {m.frequency} for {m.duration_days} days</div>
                      {m.instructions && <div className="text-slate-400 italic mt-0.5">{m.instructions}</div>}
                    </div>
                    <span className="font-semibold font-mono text-slate-700 bg-slate-50 px-2 py-1 rounded">
                      Qty: {m.quantity}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : showPrescriptionForm ? (
          /* Transaction 3 Builder Form */
          <form onSubmit={handleCreatePrescription} className="space-y-4 border border-teal-200 bg-teal-50/20 p-5 rounded-xl">
            <div className="p-3 bg-teal-50 border border-teal-200 rounded-lg text-xs text-teal-900">
              <span className="font-bold">Transaction 3 Rule:</span> Inserting prescription and medicines will automatically decrement stock in <code>medicine.stock_quantity</code>. MySQL <code className="font-bold">CHECK (stock_quantity &gt;= 0)</code> rejects overselling!
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Diagnosis *</label>
              <input
                type="text"
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                required
                placeholder="e.g. Acute bronchitis"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Advice</label>
                <input
                  type="text"
                  value={advice}
                  onChange={(e) => setAdvice(e.target.value)}
                  placeholder="e.g. Steam inhalation, drink warm fluids"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Follow-up Date</label>
                <input
                  type="date"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white"
                />
              </div>
            </div>

            {/* Medicines List */}
            <div className="space-y-2 pt-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-700 uppercase">Medicines & Quantities</span>
                <button
                  type="button"
                  onClick={addPrescItem}
                  className="text-xs text-medicore-teal font-semibold flex items-center gap-1 hover:underline"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Medicine
                </button>
              </div>

              {prescItems.map((item, idx) => {
                const selectedMed = medicinesCatalogue.find(m => String(m.medicine_id) === String(item.medicine_id));
                return (
                  <div key={idx} className="p-3 bg-white rounded-lg border border-slate-200 space-y-2 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div className="sm:col-span-2">
                        <select
                          value={item.medicine_id}
                          onChange={(e) => handleItemChange(idx, 'medicine_id', e.target.value)}
                          className="w-full p-1.5 border border-slate-200 rounded font-medium"
                        >
                          {medicinesCatalogue.map(m => (
                            <option key={m.medicine_id} value={m.medicine_id}>
                              {m.medicine_name} ({m.strength}) — Stock: {m.stock_quantity}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                          placeholder="Qty"
                          title="Quantity to dispense (decrements stock)"
                          className="w-20 p-1.5 border border-slate-200 rounded font-mono"
                        />
                        {prescItems.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removePrescItem(idx)}
                            className="p-1.5 text-slate-400 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <input
                        type="text"
                        value={item.dosage}
                        onChange={(e) => handleItemChange(idx, 'dosage', e.target.value)}
                        placeholder="Dosage (e.g. 1 tab)"
                        className="p-1.5 border border-slate-200 rounded"
                      />
                      <input
                        type="text"
                        value={item.frequency}
                        onChange={(e) => handleItemChange(idx, 'frequency', e.target.value)}
                        placeholder="Freq (e.g. Twice daily)"
                        className="p-1.5 border border-slate-200 rounded"
                      />
                      <input
                        type="number"
                        min="1"
                        value={item.duration_days}
                        onChange={(e) => handleItemChange(idx, 'duration_days', e.target.value)}
                        placeholder="Days (e.g. 7)"
                        className="p-1.5 border border-slate-200 rounded"
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowPrescriptionForm(false)}
                className="px-4 py-2 rounded text-xs border border-slate-300 text-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingPrescription}
                className="px-5 py-2 rounded bg-medicore-teal hover:bg-medicore-teal-dark text-white text-xs font-bold shadow-xs transition-colors"
              >
                {savingPrescription ? 'Saving & Updating Stock...' : 'Save Prescription (Transaction 3)'}
              </button>
            </div>
          </form>
        ) : (
          <div className="text-slate-400 text-xs italic py-2">No prescription recorded for this appointment yet.</div>
        )}
      </div>

      {/* Section 2: Lab Orders */}
      <div className="bg-white rounded-xl border border-medicore-border p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-medicore-teal" />
            <h3 className="font-serif font-bold text-lg text-slate-900">Laboratory Orders</h3>
          </div>
          {!showLabForm && (
            <button
              onClick={() => setShowLabForm(true)}
              className="px-3.5 py-1.5 rounded-lg bg-medicore-teal hover:bg-medicore-teal-dark text-white text-xs font-semibold flex items-center gap-1 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" /> Order Lab Tests
            </button>
          )}
        </div>

        {showLabForm ? (
          <form onSubmit={handleCreateLabOrder} className="space-y-4 border border-teal-200 bg-teal-50/20 p-5 rounded-xl text-xs">
            <div className="flex justify-between items-center">
              <span className="font-bold text-slate-800 uppercase">Select Tests to Order</span>
              <select
                value={labPriority}
                onChange={(e) => setLabPriority(e.target.value)}
                className="p-1.5 border border-slate-200 rounded font-semibold bg-white"
              >
                <option value="Routine">Routine</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {labTestsCatalogue.map(t => (
                <label key={t.test_id} className="p-2.5 rounded-lg border border-slate-200 bg-white flex items-start gap-2 cursor-pointer hover:border-medicore-teal">
                  <input
                    type="checkbox"
                    checked={selectedLabTests.includes(t.test_id)}
                    onChange={(e) => {
                      if (e.target.checked) setSelectedLabTests(prev => [...prev, t.test_id]);
                      else setSelectedLabTests(prev => prev.filter(x => x !== t.test_id));
                    }}
                    className="mt-0.5 rounded text-medicore-teal"
                  />
                  <div>
                    <div className="font-semibold text-slate-800">{t.test_name}</div>
                    <div className="text-slate-400 text-[10px]">{t.category} · ₹{t.price}</div>
                  </div>
                </label>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowLabForm(false)}
                className="px-4 py-2 rounded border border-slate-300 text-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingLabOrder}
                className="px-5 py-2 rounded bg-medicore-teal hover:bg-medicore-teal-dark text-white font-bold"
              >
                {savingLabOrder ? 'Ordering...' : 'Confirm Order'}
              </button>
            </div>
          </form>
        ) : appointment.lab_orders?.length === 0 ? (
          <div className="text-slate-400 text-xs italic py-2">No lab tests ordered.</div>
        ) : (
          <div className="space-y-3">
            {appointment.lab_orders?.map(order => (
              <div key={order.lab_order_id} className="p-4 rounded-lg border border-slate-200 bg-slate-50/50 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-800 font-mono">Order #{order.lab_order_id} · Priority: {order.priority}</span>
                  <span className="px-2 py-0.5 rounded font-semibold bg-slate-100 text-slate-700">{order.status}</span>
                </div>
                <div className="divide-y divide-slate-100 bg-white rounded border border-slate-200">
                  {order.tests?.map(t => (
                    <div key={t.test_id} className="p-2.5 flex justify-between items-center">
                      <div>
                        <span className="font-semibold text-slate-800">{t.test_name}</span>
                        <span className="text-slate-400 ml-2">({t.category})</span>
                      </div>
                      <div className="text-right">
                        {t.result_value ? (
                          <span className={`px-2 py-0.5 rounded font-semibold ${
                            t.result_status === 'Normal' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                          }`}>
                            {t.result_value} ({t.result_status})
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Pending Results</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section 3: Billing */}
      <div className="bg-white rounded-xl border border-medicore-border p-6 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-medicore-teal" />
            <h3 className="font-serif font-bold text-lg text-slate-900">OPD Invoice & Billing (Flow 5)</h3>
          </div>
          {!appointment.bill && (
            <button
              onClick={handleCreateBill}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs"
            >
              Generate OPD Bill
            </button>
          )}
        </div>

        {appointment.bill ? (
          <div className="p-4 bg-slate-50 rounded-lg flex justify-between items-center text-xs">
            <div>
              <div className="font-bold text-slate-900 font-mono text-sm">Bill #{appointment.bill.bill_id} ({appointment.bill.bill_type})</div>
              <div className="text-slate-500 mt-0.5">Date: {appointment.bill.bill_date}</div>
              <div className="mt-1">
                <span className={`px-2 py-0.5 rounded font-semibold ${
                  appointment.bill.payment_status === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {appointment.bill.payment_status}
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-base font-bold text-slate-900 font-serif">₹{appointment.bill.total_amount}</div>
              <div className="text-slate-500">
                Paid: ₹{appointment.bill.amount_paid} · <span className="font-bold text-red-600">Balance: ₹{appointment.bill.balance_due}</span>
              </div>
              <Link
                to={`/billing`}
                className="mt-2 inline-block px-3 py-1 rounded bg-slate-200 hover:bg-slate-300 font-semibold text-slate-800"
              >
                Go to Billing
              </Link>
            </div>
          </div>
        ) : (
          <div className="text-slate-400 text-xs italic py-2">
            No bill created for this appointment yet. Click "Generate OPD Bill" to pull consultation and prescribed medicine items into an invoice.
          </div>
        )}
      </div>
    </div>
  );
}
