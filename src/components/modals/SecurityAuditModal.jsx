import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  FileSpreadsheet,
  FileCode,
  Search,
  Filter,
  Plus,
  Trash2,
  Info,
  CheckCircle2,
  AlertTriangle,
  Lock,
  KeyRound,
  ShieldAlert
} from 'lucide-react';
import { useBoard } from '../../context/BoardContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { api, subscribeRealtimeEvents } from '../../lib/api.js';

export const SecurityAuditModal = () => {
  const { isSecurityModalOpen, setIsSecurityModalOpen, addToast } = useBoard();
  const { currentUser, toggleMfa } = useAuth();

  const [logs, setLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('logs');
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [selectedLog, setSelectedLog] = useState(null);
  const [isPurgeConfirmOpen, setIsPurgeConfirmOpen] = useState(false);

  // New Event Form
  const [isNewEventOpen, setIsNewEventOpen] = useState(false);
  const [newEventAction, setNewEventAction] = useState('');
  const [newEventDetails, setNewEventDetails] = useState('');
  const [newEventSeverity, setNewEventSeverity] = useState('medium');

  const fetchLogs = async () => {
    try {
      const res = await api.getSecurityLogs({
        search: searchQuery,
        severity: severityFilter
      });
      setLogs(res.logs || []);
    } catch (e) {
      console.error('Failed to load security logs:', e);
    }
  };

  useEffect(() => {
    if (isSecurityModalOpen) {
      fetchLogs();
      const unsubscribe = subscribeRealtimeEvents((event, payload) => {
        if (event === 'security_log_created') {
          setLogs(prev => [payload, ...prev]);
        }
      });
      return () => unsubscribe();
    }
  }, [isSecurityModalOpen, searchQuery, severityFilter]);

  if (!isSecurityModalOpen) return null;

  const downloadCsv = () => {
    window.open('/api/security/export/csv', '_blank');
    addToast('Security Audit', 'Exporting CSV compliance log...', 'info');
  };

  const downloadJson = () => {
    window.open('/api/security/export/json', '_blank');
    addToast('Security Audit', 'Exporting JSON compliance log...', 'info');
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (!newEventAction.trim()) return;

    try {
      const res = await api.logSecurityEvent(
        newEventAction,
        newEventDetails,
        newEventSeverity
      );
      addToast('Security Log', `Logged event "${res.log.action}"`, 'success');
      setNewEventAction('');
      setNewEventDetails('');
      setIsNewEventOpen(false);
      fetchLogs();
    } catch (err) {
      addToast('Error', err.message || 'Failed to record event', 'error');
    }
  };

  const handlePurgeLogs = async () => {
    try {
      await api.clearSecurityLogs();
      addToast('Security Purge', 'Audit trail purged successfully', 'info');
      setIsPurgeConfirmOpen(false);
      fetchLogs();
    } catch (err) {
      addToast('Error', err.message || 'Failed to purge logs', 'error');
    }
  };

  const severityBadges = {
    critical: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    high: 'bg-red-500/20 text-red-300 border-red-500/40',
    medium: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    low: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-5xl p-6 shadow-2xl max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 flex items-center justify-center shadow-inner">
              <ShieldCheck className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white tracking-tight flex items-center gap-2">
                Centralized Security & Governance Engine
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono">
                  SOC2 / GDPR READY
                </span>
              </h3>
              <p className="text-xs text-slate-400">RBAC policies, session audit trails, and multi-factor compliance enforcement</p>
            </div>
          </div>

          <button
            onClick={() => setIsSecurityModalOpen(false)}
            className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Controls & Global Action Toolbar */}
        <div className="flex items-center justify-between gap-3 mb-4 flex-wrap shrink-0">
          <div className="flex items-center bg-slate-800/90 p-1 rounded-xl border border-slate-700/80 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('logs')}
              className={`px-3.5 py-1.5 rounded-lg transition ${
                activeTab === 'logs' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Real-time Audit Logs ({logs.length})
            </button>
            <button
              onClick={() => setActiveTab('rbac')}
              className={`px-3.5 py-1.5 rounded-lg transition ${
                activeTab === 'rbac' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              RBAC Matrix
            </button>
            <button
              onClick={() => setActiveTab('mfa')}
              className={`px-3.5 py-1.5 rounded-lg transition ${
                activeTab === 'mfa' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              MFA Policy
            </button>
            <button
              onClick={() => setActiveTab('compliance')}
              className={`px-3.5 py-1.5 rounded-lg transition ${
                activeTab === 'compliance' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Standards & Compliance
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsNewEventOpen(!isNewEventOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 rounded-xl text-xs font-bold transition"
            >
              <Plus className="w-3.5 h-3.5" /> Log Event
            </button>
            {currentUser?.role === 'Admin' && (
              <button
                onClick={() => setIsPurgeConfirmOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl text-xs font-bold transition"
                title="Purge security logs"
              >
                <Trash2 className="w-3.5 h-3.5" /> Purge Logs
              </button>
            )}
            <button
              onClick={downloadCsv}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-bold transition"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" /> CSV
            </button>
            <button
              onClick={downloadJson}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl text-xs font-bold transition"
            >
              <FileCode className="w-3.5 h-3.5" /> JSON
            </button>
          </div>
        </div>

        {/* Inline Manual Security Log Form */}
        {isNewEventOpen && (
          <form onSubmit={handleCreateEvent} className="bg-slate-800/80 border border-indigo-500/30 p-4 rounded-2xl mb-4 text-xs space-y-3 shrink-0">
            <div className="flex items-center justify-between font-bold text-indigo-300">
              <span className="flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-indigo-400" /> Record Custom Security Event / Governance Note
              </span>
              <button type="button" onClick={() => setIsNewEventOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="sm:col-span-2">
                <label className="block text-[11px] text-slate-400 mb-1 font-medium">Action Keyword (e.g., PENTEST_COMPLETED, POLICY_UPDATE)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ANNUAL_SECURITY_AUDIT_PASSED"
                  value={newEventAction}
                  onChange={e => setNewEventAction(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1 font-medium">Severity Level</label>
                <select
                  value={newEventSeverity}
                  onChange={e => setNewEventSeverity(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1 font-medium">Audit Notes / Narrative Details</label>
              <textarea
                rows={2}
                placeholder="Details of security scan, compliance check, or manual policy override..."
                value={newEventDetails}
                onChange={e => setNewEventDetails(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsNewEventOpen(false)}
                className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 font-medium rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow transition"
              >
                Commit Security Log
              </button>
            </div>
          </form>
        )}

        {/* TAB 1: Real-time Audit Logs */}
        {activeTab === 'logs' && (
          <div className="flex-1 overflow-hidden flex flex-col space-y-3">
            {/* Search & Severity Filters */}
            <div className="flex items-center justify-between gap-2 flex-wrap shrink-0">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Filter by user, action keyword, or details..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950/90 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex items-center gap-1 bg-slate-950/80 border border-slate-800 p-1 rounded-xl text-xs">
                <span className="text-[10px] font-mono text-slate-500 px-2 font-bold uppercase flex items-center gap-1">
                  <Filter className="w-3 h-3" /> Severity:
                </span>
                {['all', 'critical', 'high', 'medium', 'low'].map(s => (
                  <button
                    key={s}
                    onClick={() => setSeverityFilter(s)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold capitalize transition ${
                      severityFilter === s
                        ? 'bg-cyan-500 text-slate-950 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Logs Table */}
            <div className="flex-1 overflow-y-auto border border-slate-800 rounded-2xl bg-slate-950/80">
              {logs.length === 0 ? (
                <div className="p-12 text-center text-slate-500 text-xs">
                  <ShieldAlert className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  No security audit records match your query filter.
                </div>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead className="sticky top-0 bg-slate-900 border-b border-slate-800 text-slate-400 font-mono text-[10px] uppercase tracking-wider z-10">
                    <tr>
                      <th className="p-3">Timestamp</th>
                      <th className="p-3">User</th>
                      <th className="p-3">Action</th>
                      <th className="p-3">Severity</th>
                      <th className="p-3">Details</th>
                      <th className="p-3 text-right">Inspect</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {logs.map(log => (
                      <tr
                        key={log.id}
                        onClick={() => setSelectedLog(log)}
                        className="hover:bg-slate-800/50 cursor-pointer transition"
                      >
                        <td className="p-3 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td className="p-3 font-bold text-slate-200 whitespace-nowrap">
                          {log.userName}
                          {log.userEmail && <div className="text-[10px] font-mono text-slate-500 font-normal">{log.userEmail}</div>}
                        </td>
                        <td className="p-3 font-mono font-semibold text-indigo-300">
                          {log.action}
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded-full font-mono text-[9px] font-bold uppercase border ${severityBadges[log.severity] || severityBadges.low}`}>
                            {log.severity}
                          </span>
                        </td>
                        <td className="p-3 text-slate-300 max-w-xs truncate">
                          {log.details || '—'}
                        </td>
                        <td className="p-3 text-right">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedLog(log);
                            }}
                            className="p-1 hover:bg-slate-700/80 text-cyan-400 hover:text-cyan-300 rounded transition"
                          >
                            <Info className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: RBAC Permissions Matrix */}
        {activeTab === 'rbac' && (
          <div className="flex-1 overflow-y-auto space-y-4 text-xs">
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-100 text-sm">Role-Based Access Control (RBAC) Governance Matrix</h4>
                  <p className="text-slate-400 text-[11px]">Enforces strict boundary checks across all REST API endpoints and UI actions.</p>
                </div>
                <div className="px-3 py-1 bg-purple-500/10 border border-purple-500/20 text-purple-300 text-[10px] font-mono rounded-full font-bold">
                  ACTIVE ROLE: {currentUser?.role}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-slate-900 p-4 rounded-xl border border-purple-500/30 space-y-2">
                  <div className="font-bold text-purple-300 text-sm flex items-center justify-between">
                    <span>Admin</span>
                    <Lock className="w-4 h-4 text-purple-400" />
                  </div>
                  <ul className="space-y-1.5 text-slate-300 leading-relaxed text-[11px]">
                    <li className="flex items-center gap-1.5 text-emerald-400"><CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> Full workspace creation & deletion</li>
                    <li className="flex items-center gap-1.5 text-emerald-400"><CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> Manage team member roles</li>
                    <li className="flex items-center gap-1.5 text-emerald-400"><CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> Export & purge compliance logs</li>
                    <li className="flex items-center gap-1.5 text-emerald-400"><CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> Configure automation rule engine</li>
                  </ul>
                </div>

                <div className="bg-slate-900 p-4 rounded-xl border border-blue-500/30 space-y-2">
                  <div className="font-bold text-blue-300 text-sm flex items-center justify-between">
                    <span>Member</span>
                    <KeyRound className="w-4 h-4 text-blue-400" />
                  </div>
                  <ul className="space-y-1.5 text-slate-300 leading-relaxed text-[11px]">
                    <li className="flex items-center gap-1.5 text-emerald-400"><CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> Create, edit, and move Kanban cards</li>
                    <li className="flex items-center gap-1.5 text-emerald-400"><CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> Comment, upload attachments, subtasks</li>
                    <li className="flex items-center gap-1.5 text-emerald-400"><CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> Trigger AI Task Decomposition</li>
                    <li className="flex items-center gap-1.5 text-amber-400"><AlertTriangle className="w-3.5 h-3.5 shrink-0" /> Cannot delete workspaces</li>
                  </ul>
                </div>

                <div className="bg-slate-900 p-4 rounded-xl border border-slate-700 space-y-2">
                  <div className="font-bold text-slate-300 text-sm flex items-center justify-between">
                    <span>Guest</span>
                    <ShieldCheck className="w-4 h-4 text-slate-400" />
                  </div>
                  <ul className="space-y-1.5 text-slate-400 leading-relaxed text-[11px]">
                    <li className="flex items-center gap-1.5 text-emerald-400"><CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> View assigned project boards</li>
                    <li className="flex items-center gap-1.5 text-emerald-400"><CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> Update status column & add notes</li>
                    <li className="flex items-center gap-1.5 text-rose-400"><X className="w-3.5 h-3.5 shrink-0" /> Restricted from workspace settings</li>
                    <li className="flex items-center gap-1.5 text-rose-400"><X className="w-3.5 h-3.5 shrink-0" /> Cannot manage automation rules</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: MFA Policy */}
        {activeTab === 'mfa' && (
          <div className="flex-1 overflow-y-auto space-y-4 text-xs">
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-6 space-y-5">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h4 className="font-bold text-base text-white mb-1">Multi-Factor Authentication (MFA) Status</h4>
                  <p className="text-slate-400 leading-relaxed">
                    Protects sensitive administrative actions (workspace deletes, API key management) with 6-digit TOTP verification.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={async () => {
                    await toggleMfa();
                    fetchLogs();
                  }}
                  className={`px-5 py-2.5 rounded-xl font-bold text-xs shadow-lg transition ${
                    currentUser?.mfaEnabled
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                  }`}
                >
                  {currentUser?.mfaEnabled ? '✓ MFA ACTIVE' : 'ENABLE MFA ENFORCEMENT'}
                </button>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2">
                <div className="font-bold text-slate-200">Active Identity Session</div>
                <div className="grid grid-cols-2 gap-2 text-slate-400 font-mono text-[11px]">
                  <div>User Name: <span className="text-slate-200 font-sans font-bold">{currentUser?.name}</span></div>
                  <div>Role: <span className="text-indigo-400 font-sans font-bold">{currentUser?.role}</span></div>
                  <div>Email: <span className="text-slate-200 font-sans font-bold">{currentUser?.email}</span></div>
                  <div>MFA Protected: <span className={currentUser?.mfaEnabled ? 'text-emerald-400 font-bold' : 'text-amber-400'}>{currentUser?.mfaEnabled ? 'YES' : 'NO'}</span></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Compliance Standards */}
        {activeTab === 'compliance' && (
          <div className="flex-1 overflow-y-auto space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-2">
                <div className="font-bold text-cyan-300 text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400" /> SOC2 Type II Audit Logging
                </div>
                <p className="text-slate-400 leading-relaxed">
                  Every mutation across workspace boards, task deletions, and role alterations generates an immutable security event with actor identity, timestamp, and client IP.
                </p>
              </div>

              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-2">
                <div className="font-bold text-emerald-300 text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> GDPR Data Subject Compliance
                </div>
                <p className="text-slate-400 leading-relaxed">
                  Exports complete user transaction records in machine-readable JSON and CSV format for regulatory data compliance requests.
                </p>
              </div>

              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-2">
                <div className="font-bold text-indigo-300 text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400" /> ISO 27001 Access Control
                </div>
                <p className="text-slate-400 leading-relaxed">
                  Role privilege enforcement guarantees strict segregation of duties between Owner, Admin, Member, and Guest users.
                </p>
              </div>

              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-2">
                <div className="font-bold text-amber-300 text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400" /> Real-time SSE Broadcasts
                </div>
                <p className="text-slate-400 leading-relaxed">
                  Security logs are pushed instantly to all open admin sessions over Server-Sent Events for zero-latency SOC oversight.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal: Selected Log Inspector Overlay */}
      {selectedLog && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 font-bold text-white text-sm">
                <ShieldCheck className="w-4 h-4 text-cyan-400" /> Security Audit Log Inspector
              </div>
              <button onClick={() => setSelectedLog(null)} className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1.5 font-mono">
                <div><span className="text-slate-500">ID:</span> <span className="text-cyan-300">{selectedLog.id}</span></div>
                <div><span className="text-slate-500">ACTION:</span> <span className="text-indigo-300 font-bold">{selectedLog.action}</span></div>
                <div><span className="text-slate-500">TIMESTAMP:</span> <span className="text-slate-300">{new Date(selectedLog.timestamp).toISOString()}</span></div>
                <div><span className="text-slate-500">ACTOR:</span> <span className="text-slate-200">{selectedLog.userName} ({selectedLog.userEmail || 'n/a'})</span></div>
                <div><span className="text-slate-500">IP ADDRESS:</span> <span className="text-slate-300">{selectedLog.ipAddress || '127.0.0.1'}</span></div>
                <div>
                  <span className="text-slate-500">SEVERITY:</span>{' '}
                  <span className={`px-2 py-0.5 rounded-full font-bold uppercase text-[9px] ${severityBadges[selectedLog.severity] || severityBadges.low}`}>
                    {selectedLog.severity}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">Narrative Details</label>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-slate-300 font-sans leading-relaxed">
                  {selectedLog.details || 'No details specified.'}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 rounded-xl transition"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Confirm Purge Logs */}
      {isPurgeConfirmOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-sm p-6 shadow-2xl space-y-4">
            <div className="w-10 h-10 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Purge Security Audit Logs?</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                This will wipe existing security audit entries. An immutable record logging this purge action will automatically be written to the new security audit log.
              </p>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsPurgeConfirmOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handlePurgeLogs}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white rounded-xl shadow-md transition"
              >
                Confirm Purge
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
