import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import ErrorAlert from '../components/ErrorAlert';
import {
  ShieldAlert,
  Play,
  RotateCcw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Database,
  Lock,
  Layers
} from 'lucide-react';

export default function RuleLab() {
  const [ruleTests, setRuleTests] = useState([]);
  const [results, setResults] = useState({}); // { [code]: resultObj }
  const [runningCode, setRunningCode] = useState(null);
  const [runningAll, setRunningAll] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get('/lab-tools/rule-tests')
      .then(setRuleTests)
      .catch(setError);
  }, []);

  const runTest = async (code) => {
    setRunningCode(code);
    setError(null);
    try {
      const res = await api.post(`/lab-tools/rule-tests/${code}/run`);
      setResults(prev => ({ ...prev, [code]: res }));
    } catch (err) {
      setError(err);
    } finally {
      setRunningCode(null);
    }
  };

  const runAllTests = async () => {
    setRunningAll(true);
    setError(null);
    for (const test of ruleTests) {
      try {
        const res = await api.post(`/lab-tools/rule-tests/${test.code}/run`);
        setResults(prev => ({ ...prev, [test.code]: res }));
      } catch (err) {
        console.error('Test run failed', test.code, err);
      }
    }
    setRunningAll(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#123B5D] flex items-center justify-center text-white shadow-xs">
              <ShieldAlert className="w-4 h-4 text-[#16A6A1]" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold font-heading text-[#123B5D]">Database Integrity & Constraint Audit</h1>
          </div>
          <p className="text-xs text-[#657B8F] mt-1">
            Automated verification of database constraints (PRIMARY, UNIQUE, FOREIGN KEY, CHECK, CASCADE). Statements execute in isolated transactions and are immediately rolled back.
          </p>
        </div>

        <button
          onClick={runAllTests}
          disabled={runningAll || ruleTests.length === 0}
          className="px-5 py-2.5 rounded-xl bg-[#123B5D] hover:bg-[#0C273E] text-white font-semibold text-xs shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          {runningAll ? 'Executing Suite...' : 'Run Constraint Audit Suite'}
        </button>
      </div>

      <ErrorAlert error={error} onClose={() => setError(null)} />

      {/* Overview Banner */}
      <div className="p-4 bg-[#123B5D] rounded-2xl text-white text-xs flex flex-col md:flex-row items-center justify-between gap-4 shadow-xs border border-[#0C273E]">
        <div className="flex items-center gap-3">
          <Lock className="w-5 h-5 text-[#35C2BD] flex-shrink-0" />
          <div>
            <div className="font-bold text-sm">Transactional Safety Guarantee</div>
            <p className="text-slate-300 text-xs mt-0.5">
              Testing operations run in rollback-only connections. Successful rejection by MySQL confirms active schema integrity enforcement.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="px-2.5 py-1 rounded-lg bg-[#DDF3EE] text-[#0C685B] font-semibold border border-[#BFE7DE]">
            Enforced (Blocked)
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-red-100 text-red-800 font-semibold border border-red-200">
            Violation Allowed
          </span>
        </div>
      </div>

      {/* Rule Tests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ruleTests.map(test => {
          const res = results[test.code];
          const isRunning = runningCode === test.code;
          const isCascade = test.code.startsWith('CASCADE');

          return (
            <div
              key={test.code}
              className={`bg-white rounded-xl border p-5 shadow-xs transition-all space-y-3 ${
                res?.blocked
                  ? 'border-emerald-300 ring-1 ring-emerald-200'
                  : res?.cascadeSuccess
                    ? 'border-teal-300 ring-1 ring-teal-200'
                    : res && !res.blocked
                      ? 'border-red-400 ring-2 ring-red-200'
                      : 'border-medicore-border'
              }`}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                      {test.code}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                      test.ruleType.includes('UNIQUE') ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                      test.ruleType.includes('FOREIGN') ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                      test.ruleType.includes('CHECK') ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                      test.ruleType.includes('CASCADE') ? 'bg-teal-50 text-teal-700 border border-teal-200' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {test.ruleType}
                    </span>
                  </div>
                  <h4 className="font-semibold text-sm text-slate-900 mt-2">
                    {test.description}
                  </h4>
                </div>

                <button
                  onClick={() => runTest(test.code)}
                  disabled={isRunning || runningAll}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1.5 disabled:opacity-40"
                >
                  <Play className="w-3 h-3 fill-current" />
                  {isRunning ? 'Running...' : 'Run'}
                </button>
              </div>

              {/* SQL Snippet */}
              <div className="bg-slate-900 p-2.5 rounded-lg font-mono text-[11px] text-slate-300 overflow-x-auto max-h-24">
                {test.sql}
              </div>

              {/* Execution Feedback */}
              {res && (
                <div className={`p-3 rounded-lg text-xs space-y-1.5 ${
                  res.blocked
                    ? 'bg-emerald-50/80 border border-emerald-200 text-emerald-950'
                    : res.cascadeSuccess
                      ? 'bg-teal-50/80 border border-teal-200 text-teal-950'
                      : 'bg-red-50 border border-red-200 text-red-950'
                }`}>
                  <div className="flex items-center gap-1.5 font-bold">
                    {res.blocked ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        <span className="text-emerald-800">
                          BLOCKED BY MYSQL ✓ (Error {res.errno})
                        </span>
                      </>
                    ) : res.cascadeSuccess ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0" />
                        <span className="text-teal-800">CASCADE VERIFIED & ROLLED BACK ✓</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                        <span className="text-red-800">RULE BROKEN / STATEMENT SUCCEEDED ✕</span>
                      </>
                    )}
                  </div>

                  <div className="text-[11px] font-medium">
                    {res.friendlyMessage || res.message}
                  </div>

                  {res.rawError && (
                    <div className="text-[10px] font-mono text-slate-600 bg-white/70 p-1.5 rounded border border-slate-200/60 mt-1">
                      Raw MySQL: {res.rawError}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
