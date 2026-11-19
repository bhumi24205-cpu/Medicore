import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, UserCheck, Globe, Database } from 'lucide-react';

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
    <header className="h-16 bg-white border-b border-[#E1EDF5] px-6 flex items-center justify-between shadow-xs flex-shrink-0 z-20">
      <div className="flex items-center gap-4">
        <h2 className="text-base font-bold text-[#123B5D] font-heading tracking-tight">
          MediCore Clinical Management
        </h2>
        <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#DDF3EE] text-[#0C685B] border border-[#BFE7DE]">
          <Database className="w-3.5 h-3.5 text-[#16A6A1]" /> Active Database: MySQL 8
        </span>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        {/* Link back to public website */}
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#123B5D] bg-[#F5FAFC] hover:bg-[#E1EDF5] border border-[#C2DBEB] transition-colors"
          title="Return to Public Hospital Website"
        >
          <Globe className="w-3.5 h-3.5 text-[#16A6A1]" />
          <span className="hidden sm:inline">Hospital Website</span>
        </Link>

        {/* Demo Role Switcher */}
        <div className="hidden lg:flex items-center gap-1 bg-[#F5FAFC] border border-[#E1EDF5] rounded-xl p-1 text-xs">
          <span className="text-[#657B8F] font-semibold px-2 flex items-center gap-1">
            <UserCheck className="w-3.5 h-3.5 text-[#16A6A1]" /> Switch Role:
          </span>
          {demoAccounts.map(acc => (
            <button
              key={acc.username}
              onClick={() => switchDemoRole(acc.username)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                user?.username === acc.username
                  ? 'bg-[#123B5D] text-white font-semibold shadow-xs'
                  : 'text-[#475A6C] hover:bg-[#E1EDF5]'
              }`}
            >
              {acc.label}
            </button>
          ))}
        </div>

        {/* User Info & Logout */}
        <div className="flex items-center gap-3 pl-3 border-l border-[#E1EDF5]">
          <div className="text-right">
            <div className="text-xs font-bold text-[#123B5D]">{user?.username}</div>
            <div className="text-xs text-[#16A6A1] font-semibold">{user?.role}</div>
          </div>
          <button
            onClick={logout}
            title="Log Out"
            className="p-2 text-[#657B8F] hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
