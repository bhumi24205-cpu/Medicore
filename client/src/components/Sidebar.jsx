import React from 'react';
import { NavLink } from 'react-router-dom';
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
  ShieldAlert,
  BarChart3
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const { user } = useAuth();
  const role = user?.role || 'Guest';

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['Admin', 'Receptionist', 'Doctor', 'Billing', 'Patient'] },
    { label: 'Patients', path: '/patients', icon: Users, roles: ['Admin', 'Receptionist', 'Doctor', 'Billing'] },
    { label: 'Register Patient', path: '/patients/new', icon: UserPlus, roles: ['Admin', 'Receptionist'] },
    { label: 'Doctors', path: '/doctors', icon: Stethoscope, roles: ['Admin', 'Receptionist', 'Doctor', 'Billing', 'Patient'] },
    { label: 'Departments', path: '/departments', icon: Building2, roles: ['Admin', 'Receptionist', 'Doctor', 'Billing', 'Patient'] },
    { label: 'Appointments', path: '/appointments', icon: Calendar, roles: ['Admin', 'Receptionist', 'Doctor', 'Patient'] },
    { label: 'Book Appointment', path: '/appointments/new', icon: CalendarPlus, roles: ['Admin', 'Receptionist', 'Doctor'] },
    { label: 'Inpatient & Rooms', path: '/admissions', icon: Bed, roles: ['Admin', 'Receptionist', 'Doctor'] },
    { label: 'Billing & Payments', path: '/billing', icon: Receipt, roles: ['Admin', 'Billing', 'Patient'] },
    { label: 'Pharmacy', path: '/pharmacy', icon: Pill, roles: ['Admin', 'Doctor', 'Billing'] },
    { label: 'Laboratory', path: '/lab', icon: FlaskConical, roles: ['Admin', 'Doctor'] },
    { label: 'Patient GPS Map', path: '/map', icon: MapPin, roles: ['Admin', 'Receptionist'] },
    { label: 'Analytics & Reports', path: '/reports', icon: BarChart3, roles: ['Admin', 'Billing'] },
    // Professor Showcase Pages
    { label: 'Query Explorer', path: '/lab-tools/query-explorer', icon: Terminal, highlight: true, roles: ['Admin', 'Doctor', 'Receptionist', 'Billing', 'Patient'] },
    { label: 'Rule Lab (T1–T16)', path: '/lab-tools/rule-tests', icon: ShieldAlert, highlight: true, roles: ['Admin'] },
  ];

  const visibleItems = navItems.filter(item => item.roles.includes(role));

  return (
    <aside className="w-64 bg-medicore-sidebar text-white flex flex-col flex-shrink-0 shadow-lg min-h-screen">
      {/* Brand */}
      <div className="p-5 border-b border-slate-700/60 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-medicore-teal flex items-center justify-center font-bold text-white shadow-md">
          M+
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white font-serif">MediCore</h1>
          <p className="text-xs text-slate-400 font-sans">Hospital Management</p>
        </div>
      </div>

      {/* Role Badge */}
      <div className="px-5 py-3 bg-slate-800/40 border-b border-slate-700/40 flex items-center justify-between text-xs">
        <span className="text-slate-400">Current Role:</span>
        <span className="px-2 py-0.5 rounded font-medium bg-medicore-teal/20 text-medicore-teal border border-medicore-teal/30">
          {role}
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {visibleItems.map(item => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors
                ${isActive
                  ? 'bg-medicore-teal text-white shadow-sm'
                  : item.highlight
                    ? 'text-teal-200 hover:bg-slate-800 hover:text-white border border-teal-500/20'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }
              `}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span>{item.label}</span>
              {item.highlight && (
                <span className="ml-auto text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 bg-teal-900/60 text-teal-300 rounded">
                  Demo
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-700/60 text-[11px] text-slate-400 bg-slate-900/40">
        <div>MySQL 8: <span className="text-slate-300">medicore_transactional</span></div>
        <div className="text-[10px] text-slate-500 mt-1">Raw SQL · No ORM · Full Constraints</div>
      </div>
    </aside>
  );
}
