import React from 'react';
import { AlertCircle, X } from 'lucide-react';

export default function ErrorAlert({ error, onClose }) {
  if (!error) return null;

  const message = error.message || (typeof error === 'string' ? error : 'An error occurred.');
  const detail = error.data?.detail || error.detail;
  const code = error.data?.code || error.code;

  return (
    <div className="p-4 mb-4 rounded-lg bg-red-50 border border-red-200 text-red-900 flex items-start gap-3 shadow-xs">
      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
      <div className="flex-1 text-sm">
        <div className="font-semibold text-red-800">
          {code ? `Database Rule [${code}]` : 'Error'}
        </div>
        <div className="mt-0.5 text-red-700">{message}</div>
        {detail && (
          <div className="mt-1 text-xs font-mono text-red-600/80 bg-red-100/50 p-1.5 rounded">
            MySQL: {detail}
          </div>
        )}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-red-400 hover:text-red-600 p-1 rounded"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
