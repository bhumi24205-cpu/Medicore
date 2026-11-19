import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import ErrorAlert from '../components/ErrorAlert';
import { Receipt, CreditCard, Plus, CheckCircle2, AlertCircle, Clock, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Billing() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [error, setError] = useState(null);

  // Selected bill for details & payment modal
  const [selectedBill, setSelectedBill] = useState(null);
  const [loadingBillDetails, setLoadingBillDetails] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Payment form state
  const [payAmount, setPayAmount] = useState('');
  const [payMode, setPayMode] = useState('UPI');
  const [payRef, setPayRef] = useState('');
  const [recordingPayment, setRecordingPayment] = useState(false);

  const fetchBills = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter) params.append('payment_status', statusFilter);
    if (typeFilter) params.append('bill_type', typeFilter);

    api.get(`/bills?${params.toString()}`)
      .then(setBills)
      .catch(setError)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBills();
  }, [statusFilter, typeFilter]);

  const openBillDetails = async (billId) => {
    setLoadingBillDetails(true);
    setError(null);
    try {
      const data = await api.get(`/bills/${billId}`);
      setSelectedBill(data);
      setPayAmount(String(data.balance_due > 0 ? data.balance_due : ''));
    } catch (err) {
      setError(err);
    } finally {
      setLoadingBillDetails(false);
    }
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    if (!selectedBill) return;

    const amt = parseFloat(payAmount);
    if (isNaN(amt) || amt <= 0) {
      alert('Payment amount must be greater than zero.');
      return;
    }

    setRecordingPayment(true);
    setError(null);

    try {
      // Flow 5: Payment insert + recomputing bill.payment_status from v_bill_summary in 1 transaction!
      await api.post(`/bills/${selectedBill.bill_id}/payments`, {
        amount: amt,
        payment_mode: payMode,
        transaction_ref: payRef || null
      });

      setShowPaymentModal(false);
      setPayRef('');
      // Refresh bill details and bills list
      await openBillDetails(selectedBill.bill_id);
      fetchBills();
    } catch (err) {
      setError(err);
    } finally {
      setRecordingPayment(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-serif text-slate-900">Billing & Payment Ledger</h1>
          <p className="text-xs text-slate-500 mt-1">
            Flow 5 & View <code className="text-teal-700">v_bill_summary</code> (Q15): Balance due and total amounts are derived, never hardcoded.
          </p>
        </div>
      </div>

      <ErrorAlert error={error} onClose={() => setError(null)} />

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-medicore-border shadow-xs flex flex-wrap gap-4 items-center">
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Payment Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-2 border border-slate-200 rounded-lg text-xs bg-white"
          >
            <option value="">All Statuses</option>
            <option value="Unpaid">Unpaid (Q16)</option>
            <option value="Partial">Partial (Q16)</option>
            <option value="Paid">Paid</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Bill Type</label>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="p-2 border border-slate-200 rounded-lg text-xs bg-white"
          >
            <option value="">All Types</option>
            <option value="OPD">OPD (Outpatient)</option>
            <option value="IPD">IPD (Inpatient)</option>
          </select>
        </div>
      </div>

      {/* Bills Table */}
      <div className="bg-white rounded-xl border border-medicore-border shadow-xs overflow-hidden">
        <div className="table-container">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs uppercase font-semibold">
                <th className="py-3 px-4">Bill ID & Date</th>
                <th className="py-3 px-4">Patient</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Total Amount (v_bill_summary)</th>
                <th className="py-3 px-4">Amount Paid</th>
                <th className="py-3 px-4">Balance Due</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400">Loading bills ledger...</td>
                </tr>
              ) : bills.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400 italic">No bills found.</td>
                </tr>
              ) : (
                bills.map(b => (
                  <tr key={b.bill_id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-bold font-mono text-slate-900">#{b.bill_id}</span>
                      <div className="text-xs text-slate-400">{b.bill_date}</div>
                    </td>
                    <td className="py-3 px-4">
                      <Link to={`/patients/${b.patient_id}`} className="font-semibold text-slate-800 hover:text-medicore-teal">
                        {b.patient_first_name} {b.patient_last_name}
                      </Link>
                      <div className="text-xs text-slate-400 font-mono">Patient #{b.patient_id}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-xs font-bold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {b.bill_type}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold font-serif text-slate-900">
                      ₹{Number(b.total_amount).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-semibold text-emerald-700 font-mono">
                      ₹{Number(b.amount_paid).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-bold font-mono text-red-600">
                      ₹{Number(b.balance_due).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                        b.payment_status === 'Paid' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        b.payment_status === 'Partial' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                        'bg-red-50 text-red-700 border border-red-200'
                      }`}>
                        {b.payment_status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => openBillDetails(b.bill_id)}
                        className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded bg-slate-100 hover:bg-medicore-teal hover:text-white transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" /> Details & Pay
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bill Details & Payment Modal */}
      {selectedBill && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-serif font-bold text-xl text-slate-900">
                  Invoice #{selectedBill.bill_id} ({selectedBill.bill_type})
                </h3>
                <p className="text-xs text-slate-500">
                  Patient: {selectedBill.patient_first_name} {selectedBill.patient_last_name} · Date: {selectedBill.bill_date}
                </p>
              </div>
              <button
                onClick={() => setSelectedBill(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg p-1"
              >
                ✕
              </button>
            </div>

            {/* Financial Summary */}
            <div className="grid grid-cols-3 gap-3 p-4 bg-slate-50 rounded-lg text-center">
              <div>
                <span className="text-[11px] text-slate-500 uppercase font-semibold">Total Amount</span>
                <div className="text-lg font-bold font-serif text-slate-900">₹{selectedBill.total_amount}</div>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 uppercase font-semibold">Paid to Date</span>
                <div className="text-lg font-bold font-mono text-emerald-700">₹{selectedBill.amount_paid}</div>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 uppercase font-semibold">Balance Due</span>
                <div className="text-lg font-bold font-mono text-red-600">₹{selectedBill.balance_due}</div>
              </div>
            </div>

            {/* Line Items (Weak Entity: bill_item) */}
            <div className="space-y-2">
              <h4 className="font-serif font-bold text-sm text-slate-800">
                Invoice Line Items (Table: <code>bill_item</code>)
              </h4>
              <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 text-slate-600 font-semibold">
                    <tr>
                      <th className="py-2 px-3">#</th>
                      <th className="py-2 px-3">Type</th>
                      <th className="py-2 px-3">Description</th>
                      <th className="py-2 px-3 text-right">Qty</th>
                      <th className="py-2 px-3 text-right">Unit Price</th>
                      <th className="py-2 px-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedBill.items?.map(item => (
                      <tr key={item.item_no}>
                        <td className="py-2 px-3 font-mono text-slate-400">{item.item_no}</td>
                        <td className="py-2 px-3 font-semibold text-slate-700">{item.item_type}</td>
                        <td className="py-2 px-3 text-slate-800">{item.description}</td>
                        <td className="py-2 px-3 text-right font-mono">{item.quantity}</td>
                        <td className="py-2 px-3 text-right font-mono">₹{item.unit_price}</td>
                        <td className="py-2 px-3 text-right font-bold font-mono">₹{item.line_total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Payment History (Table: payment) */}
            <div className="space-y-2">
              <h4 className="font-serif font-bold text-sm text-slate-800">
                Payments Settled (Table: <code>payment</code>)
              </h4>
              {selectedBill.payments?.length === 0 ? (
                <div className="text-xs text-slate-400 italic">No payments recorded yet.</div>
              ) : (
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg text-xs overflow-hidden">
                  {selectedBill.payments?.map(pay => (
                    <div key={pay.payment_id} className="p-3 bg-white flex justify-between items-center">
                      <div>
                        <div className="font-bold text-slate-800">Payment #{pay.payment_id} via {pay.payment_mode}</div>
                        <div className="text-slate-400 text-[10px]">
                          {pay.payment_date} {pay.transaction_ref ? `· Ref: ${pay.transaction_ref}` : ''}
                        </div>
                      </div>
                      <span className="font-bold font-mono text-emerald-700 text-sm">₹{pay.amount}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Take Payment Trigger or Status */}
            {selectedBill.balance_due > 0 ? (
              !showPaymentModal ? (
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => setShowPaymentModal(true)}
                    className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-colors flex items-center gap-1.5"
                  >
                    <CreditCard className="w-4 h-4" /> Settle Payment (Flow 5)
                  </button>
                </div>
              ) : (
                /* Payment Input Form */
                <form onSubmit={handleRecordPayment} className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-xl space-y-3 text-xs">
                  <div className="font-bold text-emerald-950 uppercase tracking-wide">
                    Record Payment (Flow 5 Transaction)
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 uppercase mb-1">Amount (₹) *</label>
                      <input
                        type="number"
                        step="0.01"
                        value={payAmount}
                        onChange={(e) => setPayAmount(e.target.value)}
                        required
                        className="w-full p-2 border border-slate-200 rounded-lg font-mono bg-white"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 uppercase mb-1">Mode *</label>
                      <select
                        value={payMode}
                        onChange={(e) => setPayMode(e.target.value)}
                        className="w-full p-2 border border-slate-200 rounded-lg bg-white"
                      >
                        <option value="UPI">UPI</option>
                        <option value="Cash">Cash</option>
                        <option value="Card">Card</option>
                        <option value="NetBanking">NetBanking</option>
                        <option value="Insurance">Insurance</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 uppercase mb-1">Transaction Ref</label>
                      <input
                        type="text"
                        value={payRef}
                        onChange={(e) => setPayRef(e.target.value)}
                        placeholder="e.g. UPI2026B"
                        className="w-full p-2 border border-slate-200 rounded-lg bg-white font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowPaymentModal(false)}
                      className="px-4 py-2 rounded border border-slate-300 text-slate-700"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={recordingPayment}
                      className="px-5 py-2 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                    >
                      {recordingPayment ? 'Processing...' : 'Submit & Recompute Status'}
                    </button>
                  </div>
                </form>
              )
            ) : (
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold text-center flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                This invoice is fully settled. Balance due is ₹0.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
