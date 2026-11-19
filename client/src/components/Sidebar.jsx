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
  ShieldAlert,
  BarChart3,
  Globe
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
    <aside className="w-64 bg-[#123B5D] text-white flex flex-col flex-shrink-0 shadow-xl min-h-screen border-r border-[#0C273E]">
      {/* Brand */}
      <div className="p-5 border-b border-[#1B4E79]/50 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#16A6A1] to-[#35C2BD] flex items-center justify-center font-bold text-white shadow-md group-hover:scale-105 transition-transform">
            M+
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-white font-heading">MediCore</h1>
            <p className="text-[11px] text-[#DDF3EE] font-sans font-medium">Hospital System</p>
          </div>
        </Link>
      </div>

      {/* Role Badge */}
      <div className="px-5 py-3 bg-[#0C273E]/60 border-b border-[#1B4E79]/40 flex items-center justify-between text-xs">
        <span className="text-slate-300">Active Role:</span>
        <span className="px-2.5 py-0.5 rounded-full font-semibold bg-[#DDF3EE] text-[#0C685B]">
          {role}
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
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
                  : item.highlight
                    ? 'text-[#DDF3EE] hover:bg-[#1B4E79] hover:text-white border border-[#16A6A1]/30'
                    : 'text-slate-200 hover:bg-[#1B4E79] hover:text-white'
                }
              `}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span>{item.label}</span>
              {item.highlight && (
                <span className="ml-auto text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 bg-[#DDF3EE] text-[#0C685B] rounded-full">
                  Demo
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-[#1B4E79]/50 text-[11px] text-slate-300 bg-[#0C273E]/50">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#16A6A1]" />
          <span>MySQL 8: <strong className="text-white">medicore_transactional</strong></span>
        </div>
        <div className="text-[10px] text-slate-400 mt-1">Raw SQL · No ORM · 20 Tables</div>
      </div>
    </aside>
  );
}
