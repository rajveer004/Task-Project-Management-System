import React, { useState } from 'react';
import {
  Search,
  Sparkles,
  Bell,
  ChevronDown,
  Kanban,
  Clock,
  Table as TableIcon,
  Calendar as CalendarIcon,
  Plus,
  Users,
  MessageSquare,
  Trash2,
  LogOut,
  LogIn,
  KeyRound
} from 'lucide-react';
import { useBoard } from '../context/BoardContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export const TopHeader = () => {
  const {
    activeBoard,
    boards,
    setActiveBoardId,
    deleteBoard,
    viewMode,
    setViewMode,
    searchQuery,
    setSearchQuery,
    selectedPriority,
    setSelectedPriority,
    setIsAiModalOpen,
    setIsNotificationsOpen,
    createBoard
  } = useBoard();

  const { currentUser, allUsers, loginAsUser, setIsLoginModalOpen, logout } = useAuth();

  const safeBoards = boards || [];
  const safeUsers = allUsers || [];

  const [isBoardDropdownOpen, setIsBoardDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isCreateBoardModalOpen, setIsCreateBoardModalOpen] = useState(false);
  const [boardToDelete, setBoardToDelete] = useState(null);
  const [newBoardName, setNewBoardName] = useState('');
  const [newBoardDesc, setNewBoardDesc] = useState('');

  const handleCreateBoardSubmit = async (e) => {
    e.preventDefault();
    if (!newBoardName.trim()) return;
    await createBoard({ name: newBoardName, description: newBoardDesc, category: 'Engineering' });
    setNewBoardName('');
    setNewBoardDesc('');
    setIsCreateBoardModalOpen(false);
  };

  return (
    <header className="h-14 border-b border-slate-800 bg-[#0f172a] flex items-center justify-between px-4 sm:px-6 shrink-0 z-20">
      {/* Left Section: Active Workspace Selector */}
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="relative">
          <button
            onClick={() => setIsBoardDropdownOpen(!isBoardDropdownOpen)}
            className="flex items-center gap-2 hover:bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-transparent hover:border-slate-700 text-left transition"
          >
            <div>
              <h1 className="text-sm sm:text-base font-semibold text-white tracking-tight flex items-center gap-2">
                <span className="max-w-[180px] sm:max-w-[240px] truncate">{activeBoard?.name || 'Workspace'}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </h1>
            </div>
          </button>

          {isBoardDropdownOpen && (
            <div className="absolute left-0 mt-1.5 w-72 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-2 z-50">
              <div className="px-3 py-1 text-[10px] font-mono uppercase font-bold text-slate-500 tracking-wider">
                Workspaces ({safeBoards.length})
              </div>
              {safeBoards.map(board => (
                <div
                  key={board.id}
                  className={`group/bitem w-full text-left px-3 py-1.5 text-xs hover:bg-slate-800 flex items-center justify-between transition ${
                    activeBoard?.id === board.id ? 'text-indigo-400 font-semibold bg-indigo-500/10' : 'text-slate-300'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setActiveBoardId(board.id);
                      setIsBoardDropdownOpen(false);
                    }}
                    className="flex-1 text-left truncate flex items-center justify-between mr-2"
                  >
                    <span className="truncate">{board.name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono shrink-0 ml-2">
                      {board.category || 'General'}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsBoardDropdownOpen(false);
                      setBoardToDelete(board);
                    }}
                    className="p-1 hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 rounded transition opacity-0 group-hover/bitem:opacity-100 shrink-0"
                    title={`Delete workspace "${board.name}"`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              <div className="border-t border-slate-800 mt-2 pt-2 px-2">
                <button
                  onClick={() => {
                    setIsBoardDropdownOpen(false);
                    setIsCreateBoardModalOpen(true);
                  }}
                  className="w-full text-left px-2 py-1.5 text-xs text-indigo-400 hover:bg-indigo-500/10 rounded-lg flex items-center gap-1.5 font-medium transition"
                >
                  <Plus className="w-3.5 h-3.5" /> Create New Workspace
                </button>
              </div>
            </div>
          )}
        </div>

        {activeBoard && (
          <button
            onClick={() => setBoardToDelete(activeBoard)}
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg border border-slate-800 hover:border-rose-500/30 transition flex items-center gap-1 text-xs"
            title={`Delete current workspace "${activeBoard.name}"`}
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden lg:inline text-[11px] font-medium text-slate-300 hover:text-rose-300">Delete Workspace</span>
          </button>
        )}

        {/* View Mode Switcher Buttons */}
        <div className="hidden md:flex items-center gap-1 bg-slate-800/90 p-1 rounded-md border border-slate-700/80">
          <button
            onClick={() => setViewMode('kanban')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition ${
              viewMode === 'kanban'
                ? 'bg-slate-700 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
            }`}
          >
            <Kanban className="w-3.5 h-3.5" />
            <span>Kanban</span>
          </button>
          <button
            onClick={() => setViewMode('gantt')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition ${
              viewMode === 'gantt'
                ? 'bg-slate-700 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Timeline</span>
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition ${
              viewMode === 'table'
                ? 'bg-slate-700 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
            }`}
          >
            <TableIcon className="w-3.5 h-3.5" />
            <span>Table</span>
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition ${
              viewMode === 'calendar'
                ? 'bg-slate-700 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
            }`}
          >
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>Calendar</span>
          </button>
          <button
            onClick={() => setViewMode('matchmaking')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition ${
              viewMode === 'matchmaking'
                ? 'bg-indigo-600 text-white font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-emerald-400" />
            <span>Team Collaboration</span>
          </button>
          <button
            onClick={() => setViewMode('chat')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition ${
              viewMode === 'chat'
                ? 'bg-slate-700 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
            <span>Team Chat</span>
          </button>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-slate-800 text-xs px-3 py-1.5 pl-8 rounded-md border border-slate-700 w-32 sm:w-48 text-slate-200 placeholder-slate-400 font-sans focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="hidden lg:block">
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="bg-slate-800 text-xs px-2 py-1.5 rounded-md border border-slate-700 text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="all">Priority: All</option>
            <option value="Urgent">Urgent</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

        <button
          onClick={() => setIsAiModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-3 py-1.5 rounded-md font-medium flex items-center gap-1.5 shadow-sm transition"
          title="Open AI Assistant"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span className="hidden sm:inline">AI Assistant</span>
        </button>

        <button
          onClick={() => setIsNotificationsOpen(true)}
          className="relative bg-slate-800 hover:bg-slate-700 p-1.5 rounded-md text-slate-300 transition border border-slate-700"
          title="Notification Center"
        >
          <Bell className="w-4 h-4" />
        </button>

        <div className="relative border-l border-slate-800 pl-2">
          <button
            onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
            className="flex items-center gap-1.5 hover:bg-slate-800 px-1.5 py-1 rounded-md transition"
          >
            <img
              src={currentUser?.avatar}
              alt={currentUser?.name}
              className="w-6 h-6 rounded-full object-cover ring-1 ring-indigo-500/50"
            />
            <span className="text-xs font-medium text-slate-200 hidden sm:inline">{currentUser?.name}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {isUserDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl py-2 z-50">
              <div className="px-3 py-2 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-200">{currentUser?.name}</div>
                  <div className="text-[10px] text-slate-400 font-mono">{currentUser?.email}</div>
                </div>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">
                  {currentUser?.role}
                </span>
              </div>

              <div className="p-1 border-b border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsLoginModalOpen(true);
                    setIsUserDropdownOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-semibold hover:bg-indigo-600/20 text-indigo-300 rounded-xl flex items-center gap-2 transition"
                >
                  <LogIn className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Login / Switch Account...</span>
                </button>
              </div>

              <div className="px-3 pt-2 pb-1 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                Teammates in Workspace
              </div>
              <div className="max-h-48 overflow-y-auto">
                {safeUsers.map(user => (
                  <button
                    key={user.id}
                    onClick={() => {
                      loginAsUser(user.id);
                      setIsUserDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs hover:bg-slate-800 flex items-center justify-between transition ${
                      currentUser?.id === user.id ? 'bg-indigo-500/10 text-indigo-400 font-bold' : 'text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <img src={user.avatar} className="w-4 h-4 rounded-full object-cover" />
                      <span className="truncate max-w-[110px]">{user.name}</span>
                    </div>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                      {user.role}
                    </span>
                  </button>
                ))}
              </div>

              <div className="border-t border-slate-800 pt-1 mt-1 px-1">
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setIsUserDropdownOpen(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs font-semibold hover:bg-rose-500/10 text-rose-400 rounded-xl flex items-center gap-2 transition"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Create Workspace */}
      {isCreateBoardModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-1">Create New Workspace</h3>
            <p className="text-xs text-slate-400 mb-4">Set up a collaborative team board with customizable columns.</p>
            <form onSubmit={handleCreateBoardSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Workspace Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Mobile App Launch Q3"
                  value={newBoardName}
                  onChange={(e) => setNewBoardName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
                <textarea
                  placeholder="Goals and scope..."
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
      {/* Modal: Delete Workspace Confirmation */}
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
    </header>
  );
};
