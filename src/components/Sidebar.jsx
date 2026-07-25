import React, { useState } from 'react';
import {
  Kanban,
  BarChart2,
  Clock,
  ShieldCheck,
  Zap,
  ChevronDown,
  Users,
  Sparkles,
  Trash2,
  LogIn,
  LogOut
} from 'lucide-react';
import { useBoard } from '../context/BoardContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export const Sidebar = () => {
  const {
    boards,
    activeBoard,
    setActiveBoardId,
    deleteBoard,
    viewMode,
    setViewMode,
    setIsAnalyticsOpen,
    setIsSecurityAuditOpen,
    setIsAutomationOpen,
    capacityMetrics
  } = useBoard();

  const { currentUser, allUsers, setIsLoginModalOpen } = useAuth();
  const [isBoardListOpen, setIsBoardListOpen] = useState(true);
  const [boardToDelete, setBoardToDelete] = useState(null);

  const safeBoards = boards || [];
  const safeMetrics = capacityMetrics || [];
  const safeUsers = allUsers || [];

  const totalActive = safeMetrics.reduce((acc, m) => acc + (m.activeTasks || 0), 0);
  const totalLimit = safeMetrics.reduce((acc, m) => acc + (m.capacityLimit || 0), 0);
  const capacityPct = totalLimit > 0 ? Math.min(100, Math.round((totalActive / totalLimit) * 100)) : 75;

  const getWorkspaceDotColor = (index) => {
    const colors = ['bg-cyan-500', 'bg-amber-500', 'bg-indigo-500', 'bg-emerald-500', 'bg-purple-500'];
    return colors[index % colors.length];
  };

  return (
    <aside className="w-60 bg-[#020617] border-r border-slate-800 flex flex-col h-full shrink-0 select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-white text-base shadow-md shadow-indigo-600/30">
            T
          </div>
          <div>
            <span className="font-bold text-slate-100 tracking-tight text-base block leading-none">
              TaskBoard
            </span>
            <span className="text-[10px] font-mono text-slate-500 tracking-widest uppercase">
              Manage Project
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Body */}
      <nav className="flex-1 p-3 space-y-5 overflow-y-auto">
        <div>
          <div className="text-[10px] uppercase font-bold text-slate-500 mb-2 px-2 tracking-widest font-mono">
            Main Navigation
          </div>
          <div className="space-y-1">
            <button
              onClick={() => setViewMode('kanban')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition ${
                viewMode === 'kanban'
                  ? 'bg-slate-800 text-white shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Kanban className="w-4 h-4 text-indigo-400" />
                <span>Task Board</span>
              </div>
            </button>

            <button
              onClick={() => setViewMode('matchmaking')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition ${
                viewMode === 'matchmaking'
                  ? 'bg-indigo-600 text-white shadow-sm font-bold'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Users className="w-4 h-4 text-emerald-400" />
                <span>Team Collaboration</span>
              </div>
              <span className="text-[9px] bg-emerald-500/20 text-emerald-300 font-bold px-1.5 py-0.2 rounded font-mono">
                HUB
              </span>
            </button>

            <button
              onClick={() => setViewMode('chat')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition ${
                viewMode === 'chat'
                  ? 'bg-slate-800 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>Workspace Chat</span>
              </div>
            </button>

            <button
              onClick={() => setIsAnalyticsOpen(true)}
              className="w-full flex items-center justify-between px-3 py-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800/50 rounded-md text-xs font-medium transition"
            >
              <div className="flex items-center gap-2.5">
                <BarChart2 className="w-4 h-4 text-emerald-400" />
                <span>Analytics</span>
              </div>
            </button>

            <button
              onClick={() => setViewMode('gantt')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition ${
                viewMode === 'gantt'
                  ? 'bg-slate-800 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-cyan-400" />
                <span>Timeline</span>
              </div>
            </button>

            <button
              onClick={() => setIsSecurityAuditOpen(true)}
              className="w-full flex items-center justify-between px-3 py-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800/50 rounded-md text-xs font-medium transition"
            >
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span>Security Log</span>
              </div>
            </button>

            <button
              onClick={() => setIsAutomationOpen(true)}
              className="w-full flex items-center justify-between px-3 py-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800/50 rounded-md text-xs font-medium transition"
            >
              <div className="flex items-center gap-2.5">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Rules Engine</span>
              </div>
            </button>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between px-2 mb-2">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest font-mono">
              Workspaces ({safeBoards.length})
            </span>
            <button
              onClick={() => setIsBoardListOpen(!isBoardListOpen)}
              className="text-slate-500 hover:text-slate-300"
            >
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isBoardListOpen ? '' : '-rotate-90'}`} />
            </button>
          </div>

          {isBoardListOpen && (
            <div className="space-y-1">
              {safeBoards.map((board, idx) => (
                <div
                  key={board.id}
                  onClick={() => setActiveBoardId(board.id)}
                  className={`group/sbitem w-full text-left px-3 py-1.5 text-xs rounded-md flex items-center justify-between gap-2 transition cursor-pointer ${
                    activeBoard?.id === board.id
                      ? 'bg-slate-800/90 text-slate-100 font-semibold border-l-2 border-indigo-500'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate flex-1 min-w-0">
                    <span className={`w-2 h-2 rounded-full ${getWorkspaceDotColor(idx)} shrink-0`} />
                    <span className="truncate">{board.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setBoardToDelete(board);
                    }}
                    className="opacity-0 group-hover/sbitem:opacity-100 p-1 hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 rounded transition shrink-0"
                    title={`Delete workspace "${board.name}"`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* Confirmation Modal for Deleting Workspace */}
      {boardToDelete && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl">
            <div className="w-10 h-10 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mb-4">
              <Trash2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">Delete Workspace?</h3>
            <p className="text-xs text-slate-400 mb-5 leading-relaxed">
              Are you sure you want to delete <strong className="text-slate-200">"{boardToDelete.name}"</strong>?
              All tasks, columns, and activity history in this workspace will be permanently removed.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setBoardToDelete(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  const id = boardToDelete.id;
                  setBoardToDelete(null);
                  await deleteBoard(id);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white rounded-lg shadow-md flex items-center gap-1.5 transition"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete Workspace
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar Footer */}
      <div className="p-3 border-t border-slate-800 bg-[#020617] space-y-2.5">
        {currentUser && (
          <div className="bg-slate-900/90 border border-slate-800 p-2 rounded-xl flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 overflow-hidden">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-7 h-7 rounded-full object-cover shrink-0 ring-1 ring-indigo-500/50"
              />
              <div className="truncate min-w-0">
                <div className="text-xs font-bold text-slate-200 truncate">{currentUser.name}</div>
                <div className="text-[10px] text-indigo-400 font-mono truncate">{currentUser.role}</div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsLoginModalOpen(true)}
              title="Login or Switch User"
              className="p-1.5 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white rounded-lg transition border border-indigo-500/30 shrink-0"
            >
              <LogIn className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <div className="flex items-center justify-between px-1">
          <div className="flex -space-x-2">
            {safeUsers.slice(0, 4).map((u) => (
              <img
                key={u.id}
                src={u.avatar}
                alt={u.name}
                title={`${u.name} (${u.role})`}
                className="w-5 h-5 rounded-full border border-[#020617] object-cover"
              />
            ))}
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Shared Workspace</span>
          </div>
        </div>

        <div className="bg-slate-800/50 rounded-lg p-2 text-[11px] border border-slate-700/80">
          <div className="flex justify-between mb-1 font-medium">
            <span className="text-slate-400">Team Capacity</span>
            <span className={`font-mono font-bold ${capacityPct > 90 ? 'text-amber-400' : 'text-indigo-400'}`}>
              {capacityPct}%
            </span>
          </div>
          <div className="w-full bg-slate-700/80 h-1 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${capacityPct > 90 ? 'bg-amber-400' : 'bg-indigo-500'}`}
              style={{ width: `${capacityPct}%` }}
            />
          </div>
        </div>
      </div>
    </aside>
  );
};
