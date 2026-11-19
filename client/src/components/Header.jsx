import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, UserCheck } from 'lucide-react';

export default function Header() {
  const { user, logout, switchDemoRole } = useAuth();

  const demoAccounts = [
    { label: 'Admin', username: 'admin' },
    { label: 'Receptionist', username: 'reception' },
    { label: 'Doctor (Rajesh)', username: 'dr.rajesh' },
    { label: 'Billing', username: 'billing' },
    { label: 'Patient (Rohan)', username: 'patient.rohan' }
  ];

  return (
    <header className="h-16 bg-white border-b border-medicore-border px-6 flex items-center justify-between shadow-sm flex-shrink-0 z-20">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-bold text-slate-800 font-serif">MediCore Health Portal</h2>
        <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
          ● Connected to MySQL 8
        </span>
      </div>

      <div className="flex items-center gap-4">
        {/* Quick Demo Role Switcher */}
        <div className="hidden sm:flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg p-1 text-xs">
          <span className="text-slate-500 font-medium px-2 flex items-center gap-1">
            <UserCheck className="w-3.5 h-3.5" /> Switch:
          </span>
          {demoAccounts.map(acc => (
            <button
              key={acc.username}
              onClick={() => switchDemoRole(acc.username)}
              className={`px-2 py-1 rounded transition-colors ${
                user?.username === acc.username
                  ? 'bg-medicore-sidebar text-white font-semibold shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              {acc.label}
            </button>
          ))}
        </div>

        {/* User Info & Logout */}
        <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
          <div className="text-right">
            <div className="text-sm font-semibold text-slate-800">{user?.username}</div>
            <div className="text-xs text-medicore-teal font-medium">{user?.role}</div>
          </div>
          <button
            onClick={logout}
            title="Log Out"
            className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
