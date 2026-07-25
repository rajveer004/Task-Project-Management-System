import React from 'react';
import { useBoard } from '../context/BoardContext.jsx';
import { ShieldCheck, Activity } from 'lucide-react';

export const BottomRail = () => {
  const { tasks, setIsSecurityAuditOpen, auditLogs } = useBoard();

  const safeAuditLogs = auditLogs || [];
  const safeTasks = tasks || [];
  const recentLog = safeAuditLogs.length > 0 ? safeAuditLogs[0] : null;

  return (
    <footer className="h-10 border-t border-slate-800 bg-[#020617] px-4 sm:px-6 flex items-center justify-between text-[11px] font-mono text-slate-400 shrink-0 z-20 select-none">
      <div className="flex items-center gap-4 sm:gap-6">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <span className="text-slate-300 font-semibold">SSE Realtime Connected</span>
        </div>

        <div className="hidden sm:block text-slate-500">
          Active: <span className="text-slate-200 font-bold">{safeTasks.length} Tasks</span>
        </div>

        <div className="hidden md:block text-slate-500">
          Stack: <span className="text-indigo-400 font-bold">Manage Project</span>
        </div>
      </div>

      <div className="flex items-center gap-4 truncate">
        {recentLog && (
          <div className="hidden lg:flex items-center gap-1.5 text-slate-500 truncate max-w-xs">
            <Activity className="w-3 h-3 text-cyan-400 shrink-0" />
            <span className="truncate">
              Recent: <span className="text-slate-300 font-semibold">{recentLog.taskTitle || recentLog.action}</span>
            </span>
          </div>
        )}

        <button
          onClick={() => setIsSecurityAuditOpen(true)}
          className="hover:text-slate-200 text-slate-400 transition flex items-center gap-1 hover:underline"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
          <span>Audit Log</span>
        </button>
      </div>
    </footer>
  );
};
