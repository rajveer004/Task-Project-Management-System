import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  CheckSquare,
  MessageSquare,
  Trash2,
  Send,
  Activity,
  FileText
} from 'lucide-react';
import { useBoard } from '../../context/BoardContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { api } from '../../lib/api.js';

export const TaskDetailModal = () => {
  const { selectedTaskId, setSelectedTaskId, tasks, updateTask, deleteTask, activeBoard } = useBoard();
  const { allUsers } = useAuth();

  const task = tasks.find(t => t.id === selectedTaskId);

  const [comments, setComments] = useState([]);
  const [activities, setActivities] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [isAiDecomposing, setIsAiDecomposing] = useState(false);
  const [aiSummary, setAiSummary] = useState(null);
  const [isAiSummarizing, setIsAiSummarizing] = useState(false);

  useEffect(() => {
    if (selectedTaskId) {
      api.getComments(selectedTaskId).then(res => setComments(res.comments));
      api.getTaskActivities(selectedTaskId).then(res => setActivities(res.activities));
      setAiSummary(null);
    }
  }, [selectedTaskId]);

  if (!task || !activeBoard) return null;

  const handleSubtaskToggle = (subtaskId) => {
    const updated = task.subtasks.map(s => (s.id === subtaskId ? { ...s, completed: !s.completed } : s));
    updateTask(task.id, { subtasks: updated });
  };

  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    const newSub = {
      id: `sub_${Date.now()}`,
      title: newSubtaskTitle,
      completed: false,
      estimatedHours: 2
    };
    updateTask(task.id, { subtasks: [...task.subtasks, newSub] });
    setNewSubtaskTitle('');
  };

  const handleRemoveSubtask = (subtaskId) => {
    updateTask(task.id, { subtasks: task.subtasks.filter(s => s.id !== subtaskId) });
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const mentionsFound = [];
    allUsers.forEach(u => {
      if (newComment.includes(`@${u.name}`)) {
        mentionsFound.push(u.name);
      }
    });

    const res = await api.addComment(task.id, newComment, mentionsFound);
    setComments(prev => [...prev, res.comment]);
    setNewComment('');
  };

  const handleAiBreakdown = async () => {
    setIsAiDecomposing(true);
    try {
      const res = await api.decomposeTask(task.title, task.description);
      const generatedSubtasks = res.result.subtasks.map((s, idx) => ({
        id: `sub_ai_${Date.now()}_${idx}`,
        title: s.title,
        completed: false,
        estimatedHours: s.estimatedHours
      }));

      updateTask(task.id, {
        description: task.description || res.result.suggestedDescription,
        priority: res.result.suggestedPriority,
        tags: Array.from(new Set([...task.tags, ...res.result.suggestedTags])),
        estimatedHours: res.result.estimatedTimeHours,
        subtasks: [...task.subtasks, ...generatedSubtasks]
      });
    } catch (err) {
      console.error('AI Breakdown error:', err);
    } finally {
      setIsAiDecomposing(false);
    }
  };

  const handleAiSummarizeThread = async () => {
    setIsAiSummarizing(true);
    try {
      const res = await api.summarizeComments(task.id, task.title);
      setAiSummary(res.summary);
    } catch (err) {
      console.error('AI Summarize error:', err);
    } finally {
      setIsAiSummarizing(false);
    }
  };

  const completedSubtasks = task.subtasks?.filter(s => s.completed).length || 0;
  const totalSubtasks = task.subtasks?.length || 0;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
        
        <div className="p-6 border-b border-slate-800 flex items-start justify-between gap-4 sticky top-0 bg-slate-900 z-10">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <select
                value={task.listId}
                onChange={(e) => updateTask(task.id, { listId: e.target.value })}
                className="bg-slate-800 text-xs font-bold text-slate-200 border border-slate-700 rounded-lg px-2.5 py-1 focus:outline-none"
              >
                {activeBoard.columns.map(c => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>

              <select
                value={task.priority}
                onChange={(e) => updateTask(task.id, { priority: e.target.value })}
                className="bg-slate-800 text-xs font-bold text-slate-200 border border-slate-700 rounded-lg px-2.5 py-1 focus:outline-none"
              >
                <option value="Urgent">Urgent Priority</option>
                <option value="High">High Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="Low">Low Priority</option>
              </select>
            </div>

            <input
              type="text"
              value={task.title}
              onChange={(e) => updateTask(task.id, { title: e.target.value })}
              className="w-full bg-transparent font-bold text-xl text-white border-b border-transparent hover:border-slate-700 focus:border-indigo-500 focus:outline-none py-1 transition"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleAiBreakdown}
              disabled={isAiDecomposing}
              className="flex items-center gap-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-lg shadow-purple-500/20 transition transform hover:-translate-y-0.5 disabled:opacity-50"
            >
              <Sparkles className={`w-3.5 h-3.5 text-amber-300 ${isAiDecomposing ? 'animate-spin' : ''}`} />
              <span>{isAiDecomposing ? 'Decomposing...' : 'AI Breakdown'}</span>
            </button>

            <button
              onClick={() => {
                deleteTask(task.id);
                setSelectedTaskId(null);
              }}
              className="p-2 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-xl transition"
              title="Delete Task"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <button
              onClick={() => setSelectedTaskId(null)}
              className="p-2 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-indigo-400" /> Description
              </h4>
              <textarea
                value={task.description}
                placeholder="Add rich markdown notes, architectural steps, or specifications..."
                onChange={(e) => updateTask(task.id, { description: e.target.value })}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-2xl p-3.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 min-h-[110px]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <CheckSquare className="w-4 h-4 text-emerald-400" /> Subtasks ({completedSubtasks}/{totalSubtasks})
                </h4>
                {totalSubtasks > 0 && (
                  <span className="text-xs font-semibold text-indigo-400">
                    {Math.round((completedSubtasks / totalSubtasks) * 100)}% Complete
                  </span>
                )}
              </div>

              {totalSubtasks > 0 && (
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-3">
                  <div
                    className="bg-emerald-500 h-full transition-all duration-300"
                    style={{ width: `${Math.round((completedSubtasks / totalSubtasks) * 100)}%` }}
                  />
                </div>
              )}

              <div className="space-y-2 mb-3">
                {task.subtasks.map(sub => (
                  <div key={sub.id} className="flex items-center justify-between bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60 group">
                    <label className="flex items-center gap-2.5 cursor-pointer flex-1">
                      <input
                        type="checkbox"
                        checked={sub.completed}
                        onChange={() => handleSubtaskToggle(sub.id)}
                        className="rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-0"
                      />
                      <span className={`text-xs font-medium ${sub.completed ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                        {sub.title}
                      </span>
                    </label>
                    <button
                      onClick={() => handleRemoveSubtask(sub.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-700 text-slate-400 hover:text-red-400 rounded transition"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add new subtask step..."
                  value={newSubtaskTitle}
                  onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleAddSubtask(); }}
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
                <button
                  onClick={handleAddSubtask}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 rounded-xl border border-slate-700"
                >
                  Add Step
                </button>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-purple-400" /> Activity Discussion ({comments.length})
                </h4>

                {comments.length > 0 && (
                  <button
                    onClick={handleAiSummarizeThread}
                    disabled={isAiSummarizing}
                    className="flex items-center gap-1 bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 px-2.5 py-1 rounded-lg text-[11px] font-semibold border border-purple-500/30 transition"
                  >
                    <Sparkles className="w-3 h-3 text-purple-300" />
                    <span>{isAiSummarizing ? 'Summarizing...' : 'AI Thread Takeaways'}</span>
                  </button>
                )}
              </div>

              {aiSummary && (
                <div className="bg-purple-950/30 border border-purple-500/40 rounded-2xl p-3.5 mb-4">
                  <div className="text-xs font-bold text-purple-300 mb-1 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> Gemini AI Discussion Takeaways:
                  </div>
                  <p className="text-xs text-slate-300 whitespace-pre-line leading-relaxed">{aiSummary}</p>
                </div>
              )}

              <div className="space-y-3 mb-4 max-h-60 overflow-y-auto pr-1">
                {comments.map(c => (
                  <div key={c.id} className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700/60">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <img src={c.userAvatar} className="w-5 h-5 rounded-full object-cover" />
                        <span className="text-xs font-bold text-slate-200">{c.userName}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 pl-7">{c.content}</p>
                  </div>
                ))}
              </div>

              <form onSubmit={handleAddComment} className="flex items-center gap-2 relative">
                <input
                  type="text"
                  placeholder="Type a comment or mention team members with @..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="submit"
                  className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-md transition"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>

          <div className="space-y-6 border-t md:border-t-0 md:border-l border-slate-800 pt-6 md:pt-0 md:pl-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Assigned Team Members
              </label>
              <div className="space-y-1.5">
                {allUsers.map(user => {
                  const isAssigned = task.assignees.includes(user.id);
                  return (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => {
                        const newAssignees = isAssigned
                          ? task.assignees.filter(id => id !== user.id)
                          : [...task.assignees, user.id];
                        updateTask(task.id, { assignees: newAssignees });
                      }}
                      className={`w-full flex items-center justify-between p-2 rounded-xl text-xs transition border ${
                        isAssigned
                          ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40 font-bold'
                          : 'bg-slate-800/60 text-slate-400 border-slate-700/60 hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <img src={user.avatar} className="w-5 h-5 rounded-full object-cover" />
                        <span>{user.name}</span>
                      </div>
                      <span className="text-[10px] opacity-70">{user.role}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  value={task.dueDate || ''}
                  onChange={(e) => updateTask(task.id, { dueDate: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Estimated Hours</label>
                  <input
                    type="number"
                    value={task.estimatedHours || 0}
                    onChange={(e) => updateTask(task.id, { estimatedHours: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1 text-xs text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Actual Hours</label>
                  <input
                    type="number"
                    value={task.actualHours || 0}
                    onChange={(e) => updateTask(task.id, { actualHours: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1 text-xs text-slate-200"
                  />
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 text-indigo-400" /> Card Audit Log
              </h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {activities.map(act => (
                  <div key={act.id} className="text-[11px] text-slate-400 bg-slate-800/40 p-2 rounded-lg border border-slate-800">
                    <span className="font-bold text-slate-300">{act.userName}</span> {act.action}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
