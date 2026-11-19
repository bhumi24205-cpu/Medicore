import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { Pill, AlertTriangle, CheckCircle, Package } from 'lucide-react';

export default function Pharmacy() {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/clinical/medicines')
      .then(setMedicines)
      .catch(console.error)
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
                        <span className="font-medium text-slate-700">{m.dosage_form}</span>
                        <span className="text-slate-400 ml-1 font-mono text-xs">({m.strength})</span>
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
