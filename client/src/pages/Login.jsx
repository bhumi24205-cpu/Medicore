import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, UserCheck, Database, KeyRound, CheckCircle2 } from 'lucide-react';
import ErrorAlert from '../components/ErrorAlert';
import { api } from '../api/client';

export default function Login() {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // MySQL Connection Configuration modal/tab
  const [showDbConfig, setShowDbConfig] = useState(false);
  const [dbPassword, setDbPassword] = useState('');
  const [testingDb, setTestingDb] = useState(false);
  const [dbSuccess, setDbSuccess] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(username, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err);
      if (err.message?.includes('Access denied') || err.data?.errno === 1045) {
        setShowDbConfig(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleConnectDb = async (e) => {
    e.preventDefault();
    setTestingDb(true);
    setError(null);
    setDbSuccess(false);
    try {
      const res = await api.post('/auth/db-config', { password: dbPassword });
      setDbSuccess(true);
      setTimeout(async () => {
        // Auto sign in as admin
        try {
          await login('admin', 'password123');
          navigate('/dashboard');
        } catch (e) {
          setShowDbConfig(false);
        }
      }, 1000);
    } catch (err) {
      setError(err);
    } finally {
      setTestingDb(false);
    }
  };

  const demoQuickLogin = async (u) => {
    setError(null);
    setLoading(true);
    try {
      await login(u, 'password123');
      navigate('/dashboard');
    } catch (err) {
      setError(err);
      if (err.message?.includes('Access denied') || err.data?.errno === 1045) {
        setShowDbConfig(true);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-6 text-slate-100">
      <div className="max-w-md w-full bg-white rounded-xl shadow-2xl p-8 text-slate-800">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-medicore-teal text-white flex items-center justify-center font-bold text-2xl mx-auto shadow-md">
            M+
          </div>
          <h1 className="text-2xl font-bold font-serif text-slate-900 mt-3">MediCore Hospital</h1>
          <p className="text-xs text-slate-500 mt-1">MySQL 8 Transactional Hospital Management</p>
        </div>

        <ErrorAlert error={error} onClose={() => setError(null)} />

        {/* Database Configuration Card if MySQL password is required */}
        {showDbConfig && (
          <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs space-y-3">
            <div className="flex items-center gap-2 font-bold text-amber-900">
              <Database className="w-4 h-4 text-amber-700" /> Connect MySQL Database
            </div>
            <p className="text-amber-800 text-[11px] leading-relaxed">
              Your local MySQL server (port 3306) requires a root password. Enter your MySQL root password below to link the database:
            </p>

            {dbSuccess ? (
              <div className="p-2.5 rounded bg-emerald-100 text-emerald-800 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Connected! Loading dashboard...
              </div>
            ) : (
              <form onSubmit={handleConnectDb} className="space-y-2">
                <input
                  type="password"
                  value={dbPassword}
                  onChange={(e) => setDbPassword(e.target.value)}
                  placeholder="Enter MySQL root password..."
                  className="w-full px-3 py-2 text-xs border border-amber-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-medicore-teal font-mono"
                />
                <button
                  type="submit"
                  disabled={testingDb}
                  className="w-full py-2 bg-medicore-teal hover:bg-medicore-teal-dark text-white font-bold rounded-lg transition-colors shadow-xs disabled:opacity-50"
                >
                  {testingDb ? 'Connecting & Verifying...' : 'Connect to MySQL'}
                </button>
              </form>
            )}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="e.g. admin or root"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-medicore-teal/50 focus:border-medicore-teal text-sm font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-medicore-teal/50 focus:border-medicore-teal text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-lg bg-medicore-sidebar hover:bg-slate-800 text-white font-medium text-sm transition-colors shadow-md disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        {/* Database setup link */}
        <div className="text-center mt-3">
          <button
            type="button"
            onClick={() => setShowDbConfig(!showDbConfig)}
            className="text-[11px] text-slate-400 hover:text-medicore-teal font-medium flex items-center justify-center gap-1 mx-auto"
          >
            <Database className="w-3 h-3" />
            {showDbConfig ? 'Hide MySQL Configuration' : 'Configure MySQL Root Password'}
          </button>
        </div>

        {/* Quick Demo Logins */}
        <div className="mt-6 pt-5 border-t border-slate-200">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
            <UserCheck className="w-3.5 h-3.5 text-medicore-teal" /> Quick Demo Role Logins
          </div>
          <p className="text-[11px] text-slate-500 mb-3">One-click sign-in to test role-based permissions (default pass: password123):</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => demoQuickLogin('admin')}
              className="p-2 text-left rounded border border-slate-200 hover:border-medicore-teal hover:bg-teal-50/50 transition-colors"
            >
              <div className="font-semibold text-slate-800">Admin</div>
              <div className="text-[10px] text-slate-500">Full system & Rule Lab</div>
            </button>
            <button
              onClick={() => demoQuickLogin('reception')}
              className="p-2 text-left rounded border border-slate-200 hover:border-medicore-teal hover:bg-teal-50/50 transition-colors"
            >
              <div className="font-semibold text-slate-800">Receptionist</div>
              <div className="text-[10px] text-slate-500">Registration & bookings</div>
            </button>
            <button
              onClick={() => demoQuickLogin('dr.rajesh')}
              className="p-2 text-left rounded border border-slate-200 hover:border-medicore-teal hover:bg-teal-50/50 transition-colors"
            >
              <div className="font-semibold text-slate-800">Doctor (Rajesh)</div>
              <div className="text-[10px] text-slate-500">Prescriptions & labs</div>
            </button>
            <button
              onClick={() => demoQuickLogin('billing')}
              className="p-2 text-left rounded border border-slate-200 hover:border-medicore-teal hover:bg-teal-50/50 transition-colors"
            >
              <div className="font-semibold text-slate-800">Billing</div>
              <div className="text-[10px] text-slate-500">Invoices & payments</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
