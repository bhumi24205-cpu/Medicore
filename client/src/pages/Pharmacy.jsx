import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { Pill, AlertTriangle, CheckCircle, Package } from 'lucide-react';

const FALLBACK_MEDICINES = [
  { medicine_id: 1, medicine_name: 'Atorvastatin', generic_name: 'Atorvastatin Calcium', manufacturer: 'Sun Pharma', dosage_form: 'Tablet', strength: '10mg', unit_price: 12.00, stock_quantity: 500 },
  { medicine_id: 2, medicine_name: 'Aspirin', generic_name: 'Acetylsalicylic Acid', manufacturer: 'Bayer', dosage_form: 'Tablet', strength: '75mg', unit_price: 3.50, stock_quantity: 800 },
  { medicine_id: 3, medicine_name: 'Sumatriptan', generic_name: 'Sumatriptan Succinate', manufacturer: 'Cipla', dosage_form: 'Tablet', strength: '50mg', unit_price: 25.00, stock_quantity: 200 },
  { medicine_id: 4, medicine_name: 'Ibuprofen', generic_name: 'Ibuprofen', manufacturer: 'Cipla', dosage_form: 'Tablet', strength: '400mg', unit_price: 4.00, stock_quantity: 900 },
  { medicine_id: 5, medicine_name: 'Salbutamol', generic_name: 'Salbutamol Sulphate', manufacturer: 'GSK', dosage_form: 'Syrup', strength: '100ml', unit_price: 85.00, stock_quantity: 150 },
  { medicine_id: 6, medicine_name: 'Cetirizine', generic_name: 'Cetirizine Dihydrochloride', manufacturer: 'Dr Reddys', dosage_form: 'Tablet', strength: '10mg', unit_price: 2.50, stock_quantity: 1000 },
  { medicine_id: 7, medicine_name: 'Amoxicillin', generic_name: 'Amoxicillin Trihydrate', manufacturer: 'Lupin', dosage_form: 'Capsule', strength: '500mg', unit_price: 9.00, stock_quantity: 600 },
  { medicine_id: 8, medicine_name: 'Paracetamol', generic_name: 'Paracetamol', manufacturer: 'Sun Pharma', dosage_form: 'Tablet', strength: '500mg', unit_price: 2.00, stock_quantity: 2000 },
  { medicine_id: 9, medicine_name: 'Iron Folic', generic_name: 'Ferrous Fumarate & Folic Acid', manufacturer: 'Abbott', dosage_form: 'Tablet', strength: '100mg', unit_price: 5.00, stock_quantity: 700 },
  { medicine_id: 10, medicine_name: 'Hydrocortisone', generic_name: 'Hydrocortisone Butyrate', manufacturer: 'GSK', dosage_form: 'Ointment', strength: '1%', unit_price: 60.00, stock_quantity: 120 },
  { medicine_id: 11, medicine_name: 'Diclofenac', generic_name: 'Diclofenac Sodium', manufacturer: 'Novartis', dosage_form: 'Injection', strength: '75mg', unit_price: 35.00, stock_quantity: 100 },
  { medicine_id: 12, medicine_name: 'Ofloxacin', generic_name: 'Ofloxacin', manufacturer: 'Cipla', dosage_form: 'Drops', strength: '0.3%', unit_price: 45.00, stock_quantity: 90 }
];

export default function Pharmacy() {
  const [medicines, setMedicines] = useState(FALLBACK_MEDICINES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/clinical/medicines')
      .then(res => {
        const list = Array.isArray(res) ? res : (res?.medicines || FALLBACK_MEDICINES);
        setMedicines(list.length > 0 ? list : FALLBACK_MEDICINES);
      })
      .catch(err => {
        console.warn('Pharmacy fetch fallback:', err.message);
        setMedicines(FALLBACK_MEDICINES);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-serif text-slate-900">Pharmacy & Drug Formulary</h1>
        <p className="text-xs text-slate-500 mt-1">
          Stock levels protected by database constraint: <code className="text-teal-700">CHECK (stock_quantity &gt;= 0)</code>.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-medicore-border shadow-xs overflow-hidden">
        <div className="table-container">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs uppercase font-semibold">
                <th className="py-3 px-4">Medicine Name</th>
                <th className="py-3 px-4">Generic Name</th>
                <th className="py-3 px-4">Manufacturer</th>
                <th className="py-3 px-4">Form & Strength</th>
                <th className="py-3 px-4 text-right">Unit Price</th>
                <th className="py-3 px-4 text-right">Stock Quantity</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">Loading medicines catalogue...</td>
                </tr>
              ) : (
                medicines.map(m => {
                  const isLow = m.stock_quantity < 150;
                  return (
                    <tr key={m.medicine_id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 flex items-center gap-2">
                          <Pill className="w-4 h-4 text-medicore-teal" /> {m.medicine_name}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600">{m.generic_name}</td>
                      <td className="py-3 px-4 text-slate-500 text-xs">{m.manufacturer}</td>
                      <td className="py-3 px-4">
                        <span className="font-medium text-slate-700">{m.dosage_form || 'Tablet'}</span>
                        <span className="text-slate-400 ml-1 font-mono text-xs">{m.strength ? `(${m.strength})` : ''}</span>
                      </td>
                      <td className="py-3 px-4 text-right font-bold font-serif text-slate-900">
                        ₹{m.unit_price}
                      </td>
                      <td className="py-3 px-4 text-right font-bold font-mono text-slate-800">
                        {m.stock_quantity}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                          isLow ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}>
                          {isLow ? 'Low Stock' : 'In Stock'}
                        </span>
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
