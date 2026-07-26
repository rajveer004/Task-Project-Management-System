import React, { useState } from 'react';
import {
  Table as TableIcon,
  Trash2,
  ArrowUpDown,
  Plus
} from 'lucide-react';
import { useBoard } from '../../context/BoardContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

export const TableView = () => {
  const { tasks, activeBoard, updateTask, deleteTask, setSelectedTaskId, createTask } = useBoard();
  const { allUsers } = useAuth();

  const safeTasks = tasks || [];
  const safeUsers = allUsers || [];

  const [selectedTaskIds, setSelectedTaskIds] = useState([]);
  const [sortField, setSortField] = useState('title');
  const [sortAsc, setSortAsc] = useState(true);

  if (!activeBoard) return null;

  const toggleSelectAll = () => {
    if (selectedTaskIds.length === safeTasks.length) {
      setSelectedTaskIds([]);
    } else {
      setSelectedTaskIds(safeTasks.map(t => t.id));
    }
  };

  const toggleSelectTask = (id) => {
    if (selectedTaskIds.includes(id)) {
      setSelectedTaskIds(selectedTaskIds.filter(i => i !== id));
    } else {
      setSelectedTaskIds([...selectedTaskIds, id]);
    }
  };

  const handleBulkStatusChange = (newListId) => {
    selectedTaskIds.forEach(id => {
      updateTask(id, { listId: newListId });
    });
    setSelectedTaskIds([]);
  };

  const handleBulkDelete = () => {
    selectedTaskIds.forEach(id => {
      deleteTask(id);
    });
    setSelectedTaskIds([]);
  };

  const sortedTasks = [...safeTasks].sort((a, b) => {
    let comp = 0;
    if (sortField === 'title') comp = a.title.localeCompare(b.title);
    if (sortField === 'dueDate') comp = (a.dueDate || '').localeCompare(b.dueDate || '');
    if (sortField === 'priority') comp = a.priority.localeCompare(b.priority);
    if (sortField === 'status') comp = a.listId.localeCompare(b.listId);
    return sortAsc ? comp : -comp;
  });

  const getPriorityBadgeClass = (priority) => {
    switch (priority) {
      case 'Urgent': return 'bg-rose-900/90 text-rose-200 border-rose-700/50';
      case 'High': return 'bg-amber-900/90 text-amber-200 border-amber-700/50';
      case 'Medium': return 'bg-cyan-900/90 text-cyan-200 border-cyan-700/50';
      default: return 'bg-slate-700 text-slate-300 border-slate-600';
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-[1700px] mx-auto">
      <div className="bg-[#020617] border border-slate-800 rounded-xl p-3 mb-4 flex items-center justify-between flex-wrap gap-3 shadow-md">
        <div className="flex items-center gap-3">
          <TableIcon className="w-4 h-4 text-indigo-400" />
          <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wider">Task Table View</h2>
          <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">
            {safeTasks.length} tasks
          </span>
        </div>

        {selectedTaskIds.length > 0 ? (
          <div className="flex items-center gap-2 bg-indigo-950/40 border border-indigo-500/30 px-3 py-1 rounded-lg">
            <span className="text-xs text-indigo-300 font-bold font-mono">{selectedTaskIds.length} Selected</span>
            <div className="h-3 w-px bg-slate-700" />
            
            <select
              onChange={(e) => handleBulkStatusChange(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-xs text-slate-200 rounded px-2 py-0.5 font-mono"
            >
              <option value="">Move Status...</option>
              {activeBoard.columns.map(c => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>

            <button
              onClick={handleBulkDelete}
              className="p-1 bg-red-500/20 text-red-300 hover:bg-red-500/30 rounded text-xs font-semibold flex items-center gap-1 transition border border-red-500/40"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </button>
          </div>
        ) : (
          <button
            onClick={() => createTask({ title: 'New Task', priority: 'Medium', listId: 'todo' })}
            className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white rounded shadow flex items-center gap-1.5 transition"
          >
            <Plus className="w-3.5 h-3.5" /> Add Task
          </button>
        )}
      </div>

      <div className="bg-[#1e293b] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#020617] border-b border-slate-800 text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                <th className="p-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={selectedTaskIds.length === safeTasks.length && safeTasks.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-0"
                  />
                </th>
                <th className="p-3 w-24">ID</th>
                <th
                  onClick={() => { setSortField('title'); setSortAsc(!sortAsc); }}
                  className="p-3 cursor-pointer hover:text-slate-200"
                >
                  <div className="flex items-center gap-1">
                    <span>Task Title</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th
                  onClick={() => { setSortField('status'); setSortAsc(!sortAsc); }}
                  className="p-3 cursor-pointer hover:text-slate-200"
                >
                  Status
                </th>
                <th
                  onClick={() => { setSortField('priority'); setSortAsc(!sortAsc); }}
                  className="p-3 cursor-pointer hover:text-slate-200"
                >
                  Priority
                </th>
                <th className="p-3">Assignees</th>
                <th
                  onClick={() => { setSortField('dueDate'); setSortAsc(!sortAsc); }}
                  className="p-3 cursor-pointer hover:text-slate-200"
                >
                  Due Date
                </th>
                <th className="p-3">Subtasks</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-xs text-slate-300">
              {sortedTasks.map(task => {
                const completedSubtasks = task.subtasks?.filter(s => s.completed).length || 0;
                const totalSubtasks = task.subtasks?.length || 0;
                const taskIdFormatted = `TASK-${task.id.replace(/^task_?/i, '').padStart(2, '0')}`;

                return (
                  <tr
                    key={task.id}
                    className="hover:bg-slate-800/80 transition group"
                  >
                    <td className="p-3 text-center">
                      <input
                        type="checkbox"
                        checked={selectedTaskIds.includes(task.id)}
                        onChange={() => toggleSelectTask(task.id)}
                        className="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-0"
                      />
                    </td>

                    <td className="p-3 font-mono text-[11px] text-indigo-400 font-semibold">
                      {taskIdFormatted}
                    </td>

                    <td className="p-3 font-semibold text-slate-100 max-w-xs">
                      <span
                        onClick={() => setSelectedTaskId(task.id)}
                        className="hover:text-indigo-400 cursor-pointer line-clamp-1"
                      >
                        {task.title}
                      </span>
                    </td>

                    <td className="p-3">
                      <select
                        value={task.listId}
                        onChange={(e) => updateTask(task.id, { listId: e.target.value })}
                        className="bg-slate-800 border border-slate-700 rounded px-2 py-0.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                      >
                        {activeBoard.columns.map(c => (
                          <option key={c.id} value={c.id}>{c.title}</option>
                        ))}
                      </select>
                    </td>

                    <td className="p-3">
                      <select
                        value={task.priority}
                        onChange={(e) => updateTask(task.id, { priority: e.target.value })}
                        className={`border rounded px-2 py-0.5 text-[11px] font-bold uppercase focus:outline-none ${getPriorityBadgeClass(task.priority)}`}
                      >
                        <option value="Urgent">Urgent</option>
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                      </select>
                    </td>

                    <td className="p-3">
                      <div className="flex -space-x-1">
                        {(task.assignees || []).map((aId, i) => {
                          const u = safeUsers.find(user => user.id === aId);
                          if (!u) return null;
                          return (
                            <img
                              key={i}
                              src={u.avatar}
                              title={u.name}
                              className="w-5 h-5 rounded-full object-cover ring-1 ring-slate-900"
                            />
                          );
                        })}
                      </div>
                    </td>

                    <td className="p-3 font-mono text-[11px] text-slate-400">
                      <input
                        type="date"
                        value={task.dueDate || ''}
                        onChange={(e) => updateTask(task.id, { dueDate: e.target.value })}
                        className="bg-slate-800 border border-slate-700 rounded px-2 py-0.5 text-xs text-slate-300 font-mono"
                      />
                    </td>

                    <td className="p-3.5 font-medium text-slate-400">
                      {totalSubtasks > 0 ? `${completedSubtasks}/${totalSubtasks}` : '-'}
                    </td>

                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="p-1 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded transition"
                        title="Delete Task"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
