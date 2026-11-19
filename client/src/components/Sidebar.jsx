import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  Stethoscope,
  Building2,
  Calendar,
  CalendarPlus,
  Bed,
  Receipt,
  Pill,
  FlaskConical,
  MapPin,
  Terminal,
  ShieldCheck,
  BarChart3,
  Globe
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const { user } = useAuth();
  const role = user?.role || 'Staff';

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['Admin', 'Receptionist', 'Doctor', 'Billing', 'Patient'] },
    { label: 'Patient Directory', path: '/patients', icon: Users, roles: ['Admin', 'Receptionist', 'Doctor', 'Billing'] },
    { label: 'Patient Registration', path: '/patients/new', icon: UserPlus, roles: ['Admin', 'Receptionist'] },
    { label: 'Physician Registry', path: '/doctors', icon: Stethoscope, roles: ['Admin', 'Receptionist', 'Doctor', 'Billing', 'Patient'] },
    { label: 'Clinical Departments', path: '/departments', icon: Building2, roles: ['Admin', 'Receptionist', 'Doctor', 'Billing', 'Patient'] },
    { label: 'Appointments Schedule', path: '/appointments', icon: Calendar, roles: ['Admin', 'Receptionist', 'Doctor', 'Patient'] },
    { label: 'Book Appointment', path: '/appointments/new', icon: CalendarPlus, roles: ['Admin', 'Receptionist', 'Doctor'] },
    { label: 'Inpatient & Admissions', path: '/admissions', icon: Bed, roles: ['Admin', 'Receptionist', 'Doctor'] },
    { label: 'Billing & Ledger', path: '/billing', icon: Receipt, roles: ['Admin', 'Billing', 'Patient'] },
    { label: 'Pharmacy & Stock', path: '/pharmacy', icon: Pill, roles: ['Admin', 'Doctor', 'Billing'] },
    { label: 'Clinical Laboratory', path: '/lab', icon: FlaskConical, roles: ['Admin', 'Doctor'] },
    { label: 'Geographical Catchment', path: '/map', icon: MapPin, roles: ['Admin', 'Receptionist'] },
    { label: 'Operational Analytics', path: '/reports', icon: BarChart3, roles: ['Admin', 'Billing'] },
    // Database Verification Tools
    { label: 'Query Explorer', path: '/lab-tools/query-explorer', icon: Terminal, roles: ['Admin', 'Doctor', 'Receptionist', 'Billing', 'Patient'] },
    { label: 'Constraint Audit Lab', path: '/lab-tools/rule-tests', icon: ShieldCheck, roles: ['Admin'] },
  ];

  const visibleItems = navItems.filter(item => item.roles.includes(role));

  return (
    <aside className="w-64 bg-[#123B5D] text-white flex flex-col flex-shrink-0 shadow-lg min-h-screen border-r border-[#0C273E]">
      {/* Brand */}
      <div className="p-5 border-b border-[#1B4E79]/50">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#16A6A1] flex items-center justify-center font-bold text-white shadow-xs">
            M+
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white font-heading">MediCore</h1>
            <p className="text-xs text-[#DDF3EE] font-sans font-medium">Hospital Information System</p>
          </div>
        </Link>
      </div>

      {/* Role Badge */}
      <div className="px-5 py-2.5 bg-[#0C273E]/60 border-b border-[#1B4E79]/40 flex items-center justify-between text-xs">
        <span className="text-slate-300">Active Role:</span>
        <span className="px-2.5 py-0.5 rounded-full font-semibold bg-[#DDF3EE] text-[#0C685B]">
          {role}
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
        <Link
          to="/"
          className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-[#DDF3EE] hover:bg-[#1B4E79] hover:text-white transition-colors mb-2 border border-[#16A6A1]/30 bg-[#16A6A1]/10"
        >
          <Globe className="w-4 h-4 text-[#35C2BD]" />
          <span>Public Hospital Website</span>
        </Link>

        {visibleItems.map(item => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all
                ${isActive
                  ? 'bg-[#16A6A1] text-white shadow-sm'
                  : 'text-slate-200 hover:bg-[#1B4E79] hover:text-white'
                }
              `}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-[#1B4E79]/50 text-xs text-slate-300 bg-[#0C273E]/50">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#16A6A1]" />
          <span>Database: <strong className="text-white">medicore_transactional</strong></span>
        </div>
        <div className="text-xs text-slate-400 mt-0.5">Engine: MySQL 8 (Transactional)</div>
      </div>
    </aside>
  );
}
