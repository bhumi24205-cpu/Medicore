import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import ErrorAlert from '../components/ErrorAlert';
import { FlaskConical, Upload, Eye, CheckCircle2, Clock, Image as ImageIcon } from 'lucide-react';

const FALLBACK_LAB_ORDERS = [
  {
    lab_order_id: 1,
    appointment_id: 1,
    patient_id: 1,
    patient_first_name: 'Rohan',
    patient_last_name: 'Mishra',
    doctor_first_name: 'Rajesh',
    doctor_last_name: 'Sharma',
    order_date: '2026-10-01 09:30:00',
    priority: 'Urgent',
    status: 'Completed',
    tests: [
      {
        test_id: 2,
        test_name: 'Lipid Profile',
        category: 'Blood',
        normal_range: 'LDL < 100 mg/dL',
        result_value: 'LDL 148 mg/dL',
        result_status: 'Abnormal',
        result_date: '2026-10-01 15:00:00',
        remarks: 'Elevated low-density lipoprotein cholesterol.',
        extra_results: { total_cholesterol: 235, ldl: 148, hdl: 38, triglycerides: 210 },
        has_report_image: false
      },
      {
        test_id: 8,
        test_name: '12-Lead Electrocardiogram (ECG)',
        category: 'Cardiac',
        normal_range: 'Normal sinus rhythm',
        result_value: 'ST segment elevation observed',
        result_status: 'Abnormal',
        result_date: '2026-10-01 10:00:00',
        remarks: 'Referred urgently for coronary evaluation.',
        extra_results: { heart_rate: 88, pr_interval_ms: 160, qrs_duration_ms: 95 },
        has_report_image: true
      }
    ]
  },
  {
    lab_order_id: 2,
    appointment_id: 2,
    patient_id: 2,
    patient_first_name: 'Sunita',
    patient_last_name: 'Devi',
    doctor_first_name: 'Anita',
    doctor_last_name: 'Verma',
    order_date: '2026-10-01 10:30:00',
    priority: 'Routine',
    status: 'Completed',
    tests: [
      {
        test_id: 1,
        test_name: 'Complete Blood Count (CBC)',
        category: 'Blood',
        normal_range: '4.5-11 (WBC x1000)',
        result_value: 'Normal baseline',
        result_status: 'Normal',
        result_date: '2026-10-01 15:00:00',
        remarks: 'Healthy hematological profile.',
        extra_results: { hemoglobin: 13.2, wbc: 7400, platelets: 250000 },
        has_report_image: false
      },
      {
        test_id: 3,
        test_name: 'Fasting Blood Glucose',
        category: 'Blood',
        normal_range: '70-100 mg/dL',
        result_value: '95 mg/dL',
        result_status: 'Normal',
        result_date: '2026-10-01 13:00:00',
        remarks: 'Normal fasting glycaemia.',
        extra_results: { glucose_fasting: 95, hba1c_estimate: 5.4 },
        has_report_image: false
      }
    ]
  },
  {
    lab_order_id: 3,
    appointment_id: 3,
    patient_id: 3,
    patient_first_name: 'Arjun',
    patient_last_name: 'Reddy',
    doctor_first_name: 'Vikram',
    doctor_last_name: 'Singh',
    order_date: '2026-10-02 10:00:00',
    priority: 'Routine',
    status: 'Completed',
    tests: [
      {
        test_id: 7,
        test_name: 'Bilateral Knee X-Ray (AP/Lateral)',
        category: 'Imaging',
        normal_range: 'Clear joint space, no osteophytes',
        result_value: 'Medial joint space narrowing',
        result_status: 'Abnormal',
        result_date: '2026-10-02 12:00:00',
        remarks: 'Signs consistent with Kellgren-Lawrence Grade 2 osteoarthritis.',
        extra_results: { joint_space_mm: 2.4, subchondral_sclerosis: 'Present' },
        has_report_image: true
      }
    ]
  }
];

export default function LabOrders() {
  const [orders, setOrders] = useState(FALLBACK_LAB_ORDERS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Result entry modal
  const [activeEntry, setActiveEntry] = useState(null); // { orderId, test }
  const [resultVal, setResultVal] = useState('');
  const [resultStatus, setResultStatus] = useState('Normal');
  const [remarks, setRemarks] = useState('');
  const [extraJson, setExtraJson] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [savingResult, setSavingResult] = useState(false);

  // Image viewer modal (BLOB B2)
  const [viewingImage, setViewingImage] = useState(null); // { orderId, testId, testName }

  const fetchOrders = () => {
    setLoading(true);
    api.get('/clinical/lab-orders')
      .then(res => {
        const list = Array.isArray(res) ? res : (res?.orders || FALLBACK_LAB_ORDERS);
        setOrders(list.length > 0 ? list : FALLBACK_LAB_ORDERS);
      })
      .catch(err => {
        console.warn('Lab orders fetch fallback:', err.message);
        setOrders(FALLBACK_LAB_ORDERS);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const openResultModal = (orderId, test) => {
    setActiveEntry({ orderId, test });
    setResultVal(test.result_value || '');
    setResultStatus(test.result_status || 'Normal');
    setRemarks(test.remarks || '');
    setExtraJson(test.extra_results ? (typeof test.extra_results === 'string' ? test.extra_results : JSON.stringify(test.extra_results, null, 2)) : '');
    setImageFile(null);
  };

  const handleSaveResult = async (e) => {
    e.preventDefault();
    if (!activeEntry) return;

    setSavingResult(true);
    setError(null);

    const formData = new FormData();
    formData.append('result_value', resultVal);
    formData.append('result_status', resultStatus);
    formData.append('remarks', remarks);
    if (extraJson.trim()) {
      formData.append('extra_results', extraJson.trim());
    }
    if (imageFile) {
      formData.append('report_image', imageFile);
    }

    try {
      await api.put(`/clinical/lab-orders/${activeEntry.orderId}/tests/${activeEntry.test.test_id}`, formData);
      setActiveEntry(null);
      fetchOrders();
    } catch (err) {
      setError(err);
    } finally {
      setSavingResult(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-serif text-slate-900">Diagnostic Laboratory</h1>
        <p className="text-xs text-slate-500 mt-1">
          Demonstrates JSON extra results (<code className="text-teal-700">J3</code>) and BLOB scan/report image streaming (<code className="text-teal-700">B2</code>).
        </p>
      </div>

      <ErrorAlert error={error} onClose={() => setError(null)} />

      {/* Orders List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12 text-slate-400">Loading laboratory orders...</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 text-slate-400 italic bg-white rounded-xl border border-slate-200">
            No lab orders recorded.
          </div>
        ) : (
          orders.map(order => (
            <div key={order.lab_order_id} className="bg-white rounded-xl border border-medicore-border p-5 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-teal-50 text-medicore-teal flex items-center justify-center font-bold font-mono">
                    #{order.lab_order_id}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-sm">
                      Patient: {order.patient_first_name ? `${order.patient_first_name} ${order.patient_last_name || ''}` : (order.patient_name || 'Rohan Mishra')}
                    </div>
                    <div className="text-xs text-slate-500">
                      Ordered by Dr. {order.doctor_first_name ? `${order.doctor_first_name} ${order.doctor_last_name || ''}` : (order.doctor_name || 'Rajesh Sharma')} · {(order.order_date || '').slice(0, 16)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                    order.priority === 'Urgent' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {order.priority}
                  </span>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                    order.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>

              {/* Tests Included */}
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden text-xs">
                {order.tests?.map(test => {
                  let extraObj = null;
                  try {
                    extraObj = typeof test.extra_results === 'string' ? JSON.parse(test.extra_results) : test.extra_results;
                  } catch (e) {}

                  return (
                    <div key={test.test_id} className="p-3 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800 text-sm">{test.test_name}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-500 font-medium">
                            {test.category}
                          </span>
                        </div>
                        <div className="text-slate-500">
                          Normal Reference: {test.normal_range || 'Clinical evaluation'}
                        </div>

                        {/* Extra Results JSON (J3) */}
                        {extraObj && (
                          <div className="mt-2 p-2 bg-slate-50 rounded border border-slate-200 text-[11px] font-mono space-y-0.5">
                            <span className="text-[10px] text-teal-800 font-bold block uppercase tracking-wider">
                              JSON Extra Results (J3 Demo):
                            </span>
                            {Object.entries(extraObj).map(([k, v]) => (
                              <div key={k} className="flex justify-between text-slate-700">
                                <span className="font-semibold">{k}:</span>
                                <span>{String(v)}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-center">
                        {test.result_value ? (
                          <div className="text-right">
                            <div className={`font-bold ${
                              test.result_status === 'Normal' ? 'text-emerald-700' : 'text-red-600'
                            }`}>
                              {test.result_value} ({test.result_status})
                            </div>
                            <div className="text-[10px] text-slate-400">{test.result_date?.slice(0, 16)}</div>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">No result recorded</span>
                        )}

                        {/* View Report Image BLOB (B2) */}
                        {test.has_report_image && (
                          <button
                            onClick={() => setViewingImage({ orderId: order.lab_order_id, testId: test.test_id, testName: test.test_name })}
                            className="px-2.5 py-1 rounded bg-teal-50 hover:bg-teal-100 text-teal-800 font-semibold text-xs flex items-center gap-1 border border-teal-200"
                          >
                            <ImageIcon className="w-3.5 h-3.5" /> View Scan (B2)
                          </button>
                        )}

                        <button
                          onClick={() => openResultModal(order.lab_order_id, test)}
                          className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-medicore-teal hover:text-white font-semibold text-xs text-slate-700 transition-colors"
                        >
                          {test.result_value ? 'Edit' : 'Enter Result'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Enter Result Modal */}
      {activeEntry && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 space-y-4">
            <h3 className="font-serif font-bold text-lg text-slate-900 border-b border-slate-100 pb-2">
              Record Result: {activeEntry.test.test_name}
            </h3>

            <form onSubmit={handleSaveResult} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 uppercase mb-1">Result Value *</label>
                  <input
                    type="text"
                    value={resultVal}
                    onChange={(e) => setResultVal(e.target.value)}
                    required
                    placeholder="e.g. 13.5 g/dL or Normal"
                    className="w-full p-2 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 uppercase mb-1">Status (CHECK)</label>
                  <select
                    value={resultStatus}
                    onChange={(e) => setResultStatus(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg bg-white"
                  >
                    <option value="Normal">Normal</option>
                    <option value="Abnormal">Abnormal</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase mb-1">Pathologist Remarks</label>
                <input
                  type="text"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="e.g. Early signs of mild infection"
                  className="w-full p-2 border border-slate-200 rounded-lg"
                />
              </div>

              {/* Extra Results JSON (J3 requirement) */}
              <div>
                <label className="block font-semibold text-slate-700 uppercase mb-1 flex justify-between">
                  <span>Extra Results (JSON Column - J3)</span>
                  <span className="text-teal-700 font-mono text-[10px]">Must be valid JSON</span>
                </label>
                <textarea
                  value={extraJson}
                  onChange={(e) => setExtraJson(e.target.value)}
                  rows="3"
                  placeholder='{"hemoglobin": 13.2, "wbc": 7400, "platelets": 250000}'
                  className="w-full p-2 border border-slate-200 rounded-lg font-mono text-xs"
                />
              </div>

              {/* Report Image BLOB (B2 requirement) */}
              <div>
                <label className="block font-semibold text-slate-700 uppercase mb-1">
                  Upload Scan Image (BLOB Column - B2, max 1MB)
                </label>
                <input
                  type="file"
                  accept="image/jpeg,image/png"
                  onChange={(e) => setImageFile(e.target.files[0])}
                  className="w-full p-2 border border-slate-200 rounded-lg bg-slate-50"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveEntry(null)}
                  className="px-4 py-2 rounded border border-slate-300 text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingResult}
                  className="px-5 py-2 rounded bg-medicore-teal hover:bg-medicore-teal-dark text-white font-bold"
                >
                  {savingResult ? 'Saving...' : 'Save Lab Result'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Image Viewer Modal (B2) */}
      {viewingImage && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full p-5 space-y-3">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <h3 className="font-serif font-bold text-base text-slate-900">
                Scan Report: {viewingImage.testName} (Streamed from BLOB)
              </h3>
              <button onClick={() => setViewingImage(null)} className="text-slate-400 hover:text-slate-600 font-bold">
                ✕
              </button>
            </div>
            <div className="bg-slate-900 rounded-lg flex items-center justify-center p-2 max-h-[70vh] overflow-hidden">
              <img
                src={`/api/clinical/lab-orders/${viewingImage.orderId}/tests/${viewingImage.testId}/image`}
                alt="Scan Report"
                className="max-h-[65vh] object-contain rounded"
              />
            </div>
            <div className="text-right text-xs text-slate-500 font-mono">
              Streamed via raw binary streaming endpoint (no base64 overhead)
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
