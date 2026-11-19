import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import ErrorAlert from '../components/ErrorAlert';
import { Terminal, Play, Clock, Database, Copy, Check } from 'lucide-react';

export default function QueryExplorer() {
  const [queries, setQueries] = useState([]);
  const [selectedCode, setSelectedCode] = useState('Q1');
  const [queryResult, setQueryResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    api.get('/lab-tools/queries')
      .then(list => {
        setQueries(list);
        if (list.length > 0) {
          runQuery(list[0].code);
        }
      })
      .catch(setError);
  }, []);

  const runQuery = async (codeToRun) => {
    const code = codeToRun || selectedCode;
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/lab-tools/queries/${code}`);
      setQueryResult(res);
      setSelectedCode(code);
    } catch (err) {
      setError(err);
      setQueryResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCopySql = () => {
    if (queryResult?.sql) {
      navigator.clipboard.writeText(queryResult.sql);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const selectedQueryMeta = queries.find(q => q.code === selectedCode);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-medicore-teal flex items-center justify-center text-white">
              <Terminal className="w-4 h-4" />
            </div>
            <h1 className="text-2xl font-bold font-serif text-slate-900">Query Explorer</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Professor Showcase: Interactive runner for all 30 queries in <code>medicore_test_queries.sql</code> (Q1–Q22, J1–J4, G1–G2, B1–B2).
          </p>
        </div>
      </div>

      <ErrorAlert error={error} onClose={() => setError(null)} />

      {/* Query Selector & Description */}
      <div className="bg-white p-5 rounded-xl border border-medicore-border shadow-xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Select Test Query (Q1–Q22, J1–J4, G1–G2, B1–B2)
            </label>
            <select
              value={selectedCode}
              onChange={(e) => {
                setSelectedCode(e.target.value);
                runQuery(e.target.value);
              }}
              className="w-full p-2.5 text-sm border border-slate-200 rounded-lg bg-white font-medium focus:outline-none focus:border-medicore-teal"
            >
              <optgroup label="Standard Queries (Q1 – Q11, Q16 – Q20)">
                {queries.filter(q => q.category === 'Standard SQL').map(q => (
                  <option key={q.code} value={q.code}>
                    {q.code}: {q.description}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Derived Views (Q12 – Q15)">
                {queries.filter(q => q.category.includes('Views')).map(q => (
                  <option key={q.code} value={q.code}>
                    {q.code}: {q.description}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Subqueries & Aggregates (Q21 – Q22)">
                {queries.filter(q => q.category.includes('Subqueries')).map(q => (
                  <option key={q.code} value={q.code}>
                    {q.code}: {q.description}
                  </option>
                ))}
              </optgroup>
              <optgroup label="JSON Queries (J1 – J4)">
                {queries.filter(q => q.category === 'JSON Queries').map(q => (
                  <option key={q.code} value={q.code}>
                    {q.code}: {q.description}
                  </option>
                ))}
              </optgroup>
              <optgroup label="GPS Proximity Queries (G1 – G2)">
                {queries.filter(q => q.category === 'GPS Queries').map(q => (
                  <option key={q.code} value={q.code}>
                    {q.code}: {q.description}
                  </option>
                ))}
              </optgroup>
              <optgroup label="BLOB Queries (B1 – B2)">
                {queries.filter(q => q.category === 'BLOB Queries').map(q => (
                  <option key={q.code} value={q.code}>
                    {q.code}: {q.description}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          <div className="flex items-end justify-end">
            <button
              onClick={() => runQuery(selectedCode)}
              disabled={loading}
              className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-medicore-teal hover:bg-medicore-teal-dark text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Play className="w-4 h-4 fill-current" />
              {loading ? 'Executing on MySQL...' : 'Run Query'}
            </button>
          </div>
        </div>

        {selectedQueryMeta && (
          <div className="p-3 bg-slate-50 rounded-lg text-xs flex flex-wrap items-center justify-between gap-2 border border-slate-100">
            <div>
              <span className="font-semibold text-slate-800">Category:</span>{' '}
              <span className="px-2 py-0.5 rounded bg-teal-50 text-medicore-teal font-semibold font-mono">
                {selectedQueryMeta.category}
              </span>
            </div>
            <div className="text-slate-600">
              <span className="font-semibold">Question:</span> {selectedQueryMeta.description}
            </div>
          </div>
        )}
      </div>

      {/* SQL Code Block */}
      <div className="bg-slate-900 rounded-xl overflow-hidden shadow-md border border-slate-800">
        <div className="px-4 py-2.5 bg-slate-800/80 border-b border-slate-700/60 flex items-center justify-between text-xs text-slate-300">
          <div className="flex items-center gap-2 font-mono">
            <Database className="w-3.5 h-3.5 text-medicore-teal" />
            <span>medicore_transactional / queries/{selectedCode}.sql</span>
          </div>
          <button
            onClick={handleCopySql}
            className="flex items-center gap-1 hover:text-white px-2 py-0.5 rounded hover:bg-slate-700 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy SQL'}</span>
          </button>
        </div>
        <pre className="p-4 text-xs font-mono text-emerald-400 overflow-x-auto leading-relaxed">
          {queryResult?.sql || selectedQueryMeta?.sql}
        </pre>
      </div>

      {/* Live Result Table */}
      <div className="bg-white rounded-xl border border-medicore-border shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="font-bold text-slate-800 font-serif text-sm">
            Live Query Result Set
          </div>
          {queryResult && (
            <div className="flex items-center gap-4 text-slate-500 font-mono text-[11px]">
              <span>Rows returned: <strong className="text-slate-900">{queryResult.rowCount}</strong></span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-medicore-teal" /> {queryResult.durationMs} ms
              </span>
            </div>
          )}
        </div>

        <div className="table-container max-h-96">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-bold sticky top-0">
                {queryResult?.columns?.map(col => (
                  <th key={col} className="py-2.5 px-3 whitespace-nowrap">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={queryResult?.columns?.length || 1} className="py-12 text-center text-slate-400">
                    Executing live query on MySQL 8...
                  </td>
                </tr>
              ) : !queryResult || queryResult.rows?.length === 0 ? (
                <tr>
                  <td colSpan={queryResult?.columns?.length || 1} className="py-8 text-center text-slate-400 italic">
                    Query returned 0 rows.
                  </td>
                </tr>
              ) : (
                queryResult.rows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    {queryResult.columns.map(col => {
                      const val = row[col];
                      const isNull = val === null || val === undefined;
                      return (
                        <td key={col} className="py-2 px-3 whitespace-nowrap text-slate-700">
                          {isNull ? (
                            <span className="text-slate-300 italic">NULL</span>
                          ) : typeof val === 'object' ? (
                            JSON.stringify(val)
                          ) : (
                            String(val)
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
