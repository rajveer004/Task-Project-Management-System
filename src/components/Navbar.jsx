import React, { useState } from 'react';
import {
  Kanban,
  Calendar,
  Table as TableIcon,
  GanttChart,
  Sparkles,
  ShieldCheck,
  Zap,
  Bell,
  Search,
  Plus,
  AlertTriangle,
  ChevronDown,
  Layers,
  BarChart2
} from 'lucide-react';
import { useBoard } from '../context/BoardContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export const Navbar = () => {
  const {
    boards,
    activeBoard,
    setActiveBoardId,
    viewMode,
    setViewMode,
    searchQuery,
    setSearchQuery,
    selectedPriority,
    setSelectedPriority,
    selectedAssignee,
    setSelectedAssignee,
    setIsAiModalOpen,
    setIsAutomationOpen,
    setIsSecurityAuditOpen,
    setIsAnalyticsOpen,
    setIsNotificationsOpen,
    createBoard,
    capacityMetrics
  } = useBoard();

  const { currentUser, allUsers, loginAsUser } = useAuth();

  const [isBoardDropdownOpen, setIsBoardDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isCreateBoardModalOpen, setIsCreateBoardModalOpen] = useState(false);
  const [newBoardName, setNewBoardName] = useState('');
  const [newBoardDesc, setNewBoardDesc] = useState('');

  const overloadedUsers = capacityMetrics.filter(m => m.isOverloaded);

  const handleCreateBoardSubmit = async (e) => {
    e.preventDefault();
    if (!newBoardName.trim()) return;
    await createBoard({ name: newBoardName, description: newBoardDesc, category: 'Engineering' });
    setNewBoardName('');
    setNewBoardDesc('');
    setIsCreateBoardModalOpen(false);
  };

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-30 shadow-md">
      <div className="max-w-[1700px] mx-auto px-4 py-2.5 flex items-center justify-between gap-3 flex-wrap">
        
        {/* Left Section: Logo & Workspace Selector */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 pr-3 border-r border-slate-800">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-200 bg-clip-text text-transparent">
                  TaskBoard
                </span>
                <span className="text-xs px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30">
                  Pro
                </span>
              </div>
              <span className="text-[10px] text-slate-400 block -mt-1 font-medium">Manage Project</span>
            </div>
          </div>

          {/* Workspace Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsBoardDropdownOpen(!isBoardDropdownOpen)}
              className="flex items-center gap-2 bg-slate-800/80 hover:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700/80 text-sm font-medium transition text-slate-200"
            >
              <span className="max-w-[180px] truncate">{activeBoard?.name || 'Select Board'}</span>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>

            {isBoardDropdownOpen && (
              <div className="absolute left-0 mt-2 w-64 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl py-2 z-50">
                <div className="px-3 py-1 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Boards ({boards.length})
                </div>
                {boards.map(board => (
                  <button
                    key={board.id}
                    onClick={() => {
                      setActiveBoardId(board.id);
                      setIsBoardDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-slate-700/70 flex items-center justify-between transition ${
                      activeBoard?.id === board.id ? 'text-indigo-400 font-semibold bg-indigo-500/10' : 'text-slate-300'
                    }`}
                  >
                    <span className="truncate">{board.name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700 text-slate-400">
                      {board.category || 'General'}
                    </span>
                  </button>
                ))}
                <div className="border-t border-slate-700 mt-2 pt-2 px-2">
                  <button
                    onClick={() => {
                      setIsBoardDropdownOpen(false);
                      setIsCreateBoardModalOpen(true);
                    }}
                    className="w-full text-left px-2 py-1.5 text-xs text-indigo-400 hover:bg-indigo-500/10 rounded-lg flex items-center gap-1.5 font-medium transition"
                  >
                    <Plus className="w-4 h-4" /> Create New Board
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* View Switcher */}
        <div className="flex items-center bg-slate-800/90 p-1 rounded-xl border border-slate-700/80">
          <button
            onClick={() => setViewMode('kanban')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              viewMode === 'kanban'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
            }`}
          >
            <Kanban className="w-3.5 h-3.5" />
            <span>Kanban</span>
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              viewMode === 'calendar'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Calendar</span>
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              viewMode === 'table'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
            }`}
          >
            <TableIcon className="w-3.5 h-3.5" />
            <span>Table</span>
          </button>
          <button
            onClick={() => setViewMode('gantt')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              viewMode === 'gantt'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
            }`}
          >
            <GanttChart className="w-3.5 h-3.5" />
            <span>Gantt</span>
          </button>
        </div>

        {/* Search & Filters */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500 w-44 sm:w-56"
            />
          </div>

          <div className="hidden lg:flex items-center gap-1">
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">Priority: All</option>
              <option value="Urgent">Urgent</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            <select
              value={selectedAssignee}
              onChange={(e) => setSelectedAssignee(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">Assignee: All</option>
              {allUsers.map(u => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAiModalOpen(true)}
            className="flex items-center gap-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 px-3 py-1.5 rounded-lg text-xs font-semibold text-white shadow-md"
            title="AI Task Decomposition"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span className="hidden sm:inline">AI Assistant</span>
          </button>

          <button
            onClick={() => setIsAnalyticsOpen(true)}
            className="relative flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-200 transition"
            title="Capacity & Workload"
          >
            <BarChart2 className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden md:inline">Analytics</span>
            {overloadedUsers.length > 0 && (
              <span className="flex items-center gap-1 text-[10px] bg-amber-500/20 text-amber-300 font-bold px-1.5 py-0.2 rounded border border-amber-500/40">
                <AlertTriangle className="w-3 h-3 text-amber-400 animate-pulse" />
                <span>{overloadedUsers.length} Overloaded</span>
              </span>
            )}
          </button>

          <button
            onClick={() => setIsAutomationOpen(true)}
            className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 transition"
            title="Automations"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">Rules</span>
          </button>

          <button
            onClick={() => setIsSecurityAuditOpen(true)}
            className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 transition"
            title="Security Audit"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden md:inline">Security</span>
          </button>

          <button
            onClick={() => setIsNotificationsOpen(true)}
            className="relative bg-slate-800 hover:bg-slate-700 border border-slate-700 p-2 rounded-lg text-slate-300 transition"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
          </button>

          {/* User Profile */}
          <div className="relative border-l border-slate-800 pl-2 ml-1">
            <button
              onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded-xl border border-slate-700/80 transition"
            >
              <img
                src={currentUser?.avatar}
                alt={currentUser?.name}
                className="w-6 h-6 rounded-full object-cover ring-1 ring-indigo-400/50"
              />
              <div className="text-left hidden sm:block">
                <div className="text-xs font-semibold text-slate-200 leading-tight">{currentUser?.name}</div>
                <div className="text-[10px] text-indigo-300 font-medium flex items-center gap-1">
                  <span>{currentUser?.role}</span>
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isUserDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl py-2 z-50">
                <div className="px-3 py-1.5 border-b border-slate-700/80">
                  <div className="text-xs font-bold text-slate-200">{currentUser?.name}</div>
                  <div className="text-[11px] text-slate-400">{currentUser?.email}</div>
                </div>

                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Switch Active Role Account
                </div>
                {allUsers.map(user => (
                  <button
                    key={user.id}
                    onClick={() => {
                      loginAsUser(user.id);
                      setIsUserDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs hover:bg-slate-700 flex items-center justify-between transition ${
                      currentUser?.id === user.id ? 'bg-indigo-500/20 text-indigo-300 font-bold' : 'text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <img src={user.avatar} className="w-5 h-5 rounded-full" />
                      <span>{user.name}</span>
                    </div>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-semibold ${
                      user.role === 'Admin' ? 'bg-purple-500/20 text-purple-300' : 'bg-blue-500/20 text-blue-300'
                    }`}>
                      {user.role}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Modal: Create Board */}
      {isCreateBoardModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-1">Create New Board</h3>
            <p className="text-xs text-slate-400 mb-4">Set up a task board with custom lists.</p>
            <form onSubmit={handleCreateBoardSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Board Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Q3 Roadmap"
                  value={newBoardName}
                  onChange={(e) => setNewBoardName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
                <textarea
                  placeholder="Board description..."
                  value={newBoardDesc}
                  onChange={(e) => setNewBoardDesc(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 h-20"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateBoardModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white rounded-lg shadow-md"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};
