import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';

export default function JsonChips({ label, items = [], onAdd, onRemove, editable = true, color = 'teal' }) {
  const [inputVal, setInputVal] = useState('');

  const handleAdd = (e) => {
    e.preventDefault();
    if (inputVal.trim() && !items.includes(inputVal.trim())) {
      onAdd(inputVal.trim());
      setInputVal('');
    }
  };

  const badgeColor = color === 'coral'
    ? 'bg-red-50 text-red-700 border-red-200'
    : 'bg-teal-50 text-teal-800 border-teal-200';

  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">{label}</label>
      <div className="flex flex-wrap gap-1.5 items-center min-h-[36px] p-2 bg-white border border-slate-200 rounded-lg">
        {items.length === 0 && (
          <span className="text-xs text-slate-400 italic">None recorded</span>
        )}
        {items.map(item => (
          <span
            key={item}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${badgeColor}`}
          >
            {item}
            {editable && (
              <button
                type="button"
                onClick={() => onRemove(item)}
                className="hover:opacity-75 focus:outline-none"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </span>
        ))}

        {editable && (
          <form onSubmit={handleAdd} className="inline-flex items-center gap-1 ml-1">
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="+ add..."
              className="text-xs py-1 px-2 border border-slate-200 rounded focus:outline-none focus:border-medicore-teal w-24"
            />
            <button
              type="submit"
              disabled={!inputVal.trim()}
              className="p-1 rounded bg-slate-100 hover:bg-medicore-teal hover:text-white text-slate-600 transition-colors disabled:opacity-40"
            >
              <Plus className="w-3 h-3" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
