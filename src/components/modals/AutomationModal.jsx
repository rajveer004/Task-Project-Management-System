import React, { useState, useEffect } from 'react';
import { X, Zap, Plus, Trash2, Play, CheckCircle2, Clock, Sparkles } from 'lucide-react';
import { useBoard } from '../../context/BoardContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { api, subscribeRealtimeEvents } from '../../lib/api.js';

export const AutomationModal = () => {
  const { isAutomationModalOpen, setIsAutomationModalOpen, activeBoard, boards, addToast } = useBoard();
  const { allUsers } = useAuth();

  const currentBoard = activeBoard || (boards && boards[0]);

  const [rules, setRules] = useState([]);
  const [ruleName, setRuleName] = useState('');
  const [triggerEvent, setTriggerEvent] = useState('status_changed');
  const [triggerValue, setTriggerValue] = useState('review');
  const [actionType, setActionType] = useState('auto_assign');
  const [actionValue, setActionValue] = useState('');
  const [testingRuleId, setTestingRuleId] = useState(null);

  const fetchRules = async () => {
    if (currentBoard) {
      try {
        const res = await api.getAutomations(currentBoard.id);
        setRules(res.automations || []);
      } catch (e) {
        console.error('Failed to fetch automations:', e);
      }
    }
  };

  useEffect(() => {
    if (isAutomationModalOpen && currentBoard) {
      fetchRules();
      const unsubscribe = subscribeRealtimeEvents((event) => {
        if (['automation_created', 'automation_updated', 'automation_deleted'].includes(event)) {
          fetchRules();
        }
      });
      return () => unsubscribe();
    }
  }, [isAutomationModalOpen, currentBoard]);

  // Set default action value when actionType changes
  useEffect(() => {
    if (actionType === 'auto_assign' || actionType === 'send_notification') {
      if (!actionValue || !allUsers.some(u => u.id === actionValue)) {
        setActionValue(allUsers[0]?.id || '');
      }
    } else if (actionType === 'move_list') {
      const firstCol = currentBoard?.columns?.[0]?.id || 'in_progress';
      setActionValue(firstCol);
    } else if (actionType === 'set_priority') {
      setActionValue('High');
    } else if (actionType === 'add_tag') {
      setActionValue('Automated');
    }
  }, [actionType, currentBoard, allUsers]);

  if (!isAutomationModalOpen) return null;

  const handleCreateRule = async (e) => {
    e.preventDefault();
    if (!ruleName.trim()) return;

    try {
      await api.createAutomation({
        boardId: currentBoard?.id || 'default_board',
        name: ruleName.trim(),
        triggerEvent,
        triggerValue,
        actionType,
        actionValue
      });

      addToast('Automation Created', `Added rule "${ruleName}"`, 'success');
      setRuleName('');
      fetchRules();
    } catch (err) {
      addToast('Error', err.message || 'Failed to create automation rule', 'error');
    }
  };

  const handleToggleRule = async (id) => {
    try {
      await api.toggleAutomation(id);
      fetchRules();
    } catch (err) {
      addToast('Error', err.message || 'Failed to toggle rule', 'error');
    }
  };

  const handleTestRule = async (id, name) => {
    setTestingRuleId(id);
    try {
      const res = await api.testAutomation(id);
      addToast(
        'Rule Manual Test',
        `Rule "${name}" executed successfully! Affected ${res.affectedCount} task(s).`,
        'success'
      );
      fetchRules();
    } catch (err) {
      addToast('Error', err.message || 'Failed to test rule', 'error');
    } finally {
      setTestingRuleId(null);
    }
  };

  const handleDeleteRule = async (id, name) => {
    try {
      await api.deleteAutomation(id);
      addToast('Rule Deleted', `Removed "${name}"`, 'info');
      fetchRules();
    } catch (err) {
      addToast('Error', err.message || 'Failed to delete rule', 'error');
    }
  };

  // Helper formatting for rule description
  const formatTriggerText = (rule) => {
    if (rule.triggerEvent === 'status_changed') return `Status moves to "${rule.triggerValue}"`;
    if (rule.triggerEvent === 'priority_changed') return `Priority equals "${rule.triggerValue}"`;
    if (rule.triggerEvent === 'task_created') return `New task created`;
    if (rule.triggerEvent === 'tag_added') return `Tag "${rule.triggerValue}" is added`;
    return `${rule.triggerEvent} (${rule.triggerValue})`;
  };

  const formatActionText = (rule) => {
    if (rule.actionType === 'auto_assign') {
      const u = allUsers.find(usr => usr.id === rule.actionValue);
      return `Auto-assign ${u ? u.name : rule.actionValue}`;
    }
    if (rule.actionType === 'send_notification') {
      const u = allUsers.find(usr => usr.id === rule.actionValue);
      return `Send alert to ${u ? u.name : rule.actionValue}`;
    }
    if (rule.actionType === 'move_list') {
      const col = currentBoard?.columns?.find(c => c.id === rule.actionValue);
      return `Move to column "${col ? col.title : rule.actionValue}"`;
    }
    if (rule.actionType === 'set_priority') return `Set priority to ${rule.actionValue}`;
    if (rule.actionType === 'add_tag') return `Add tag "${rule.actionValue}"`;
    return `${rule.actionType} (${rule.actionValue})`;
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl p-6 shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center shadow-inner">
              <Zap className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white tracking-tight flex items-center gap-2">
                Board Automation & Rule Engine
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
                  EVENT-DRIVEN
                </span>
              </h3>
              <p className="text-xs text-slate-400">Trigger-action workflows for board status, priority, and assignment events</p>
            </div>
          </div>

          <button
            onClick={() => setIsAutomationModalOpen(false)}
            className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Existing Rules List */}
        <div className="flex-1 overflow-y-auto space-y-3 mb-5 pr-1 min-h-[160px]">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between sticky top-0 bg-slate-900/90 backdrop-blur pb-2 z-10">
            <span>Configured Active Rules ({rules.length})</span>
            <span className="text-[10px] text-slate-500 font-mono font-normal">Workspace: {currentBoard?.name || 'Default Workspace'}</span>
          </div>

          {rules.length === 0 ? (
            <div className="p-8 text-center bg-slate-950/50 border border-slate-800 rounded-2xl text-slate-500 text-xs">
              <Sparkles className="w-6 h-6 text-amber-500/50 mx-auto mb-2" />
              No automation rules configured for this workspace yet. Create your first rule below!
            </div>
          ) : (
            rules.map(rule => (
              <div
                key={rule.id}
                className={`p-4 rounded-2xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  rule.enabled
                    ? 'bg-slate-800/80 border-slate-700/80 hover:border-amber-500/40'
                    : 'bg-slate-950/60 border-slate-800/60 opacity-70'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white">{rule.name}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-900 border border-slate-700 text-amber-300">
                      {rule.runCount || 0} runs
                    </span>
                  </div>

                  <div className="text-xs text-slate-300 flex items-center gap-1.5 flex-wrap">
                    <span className="text-slate-400">WHEN</span>
                    <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 font-semibold border border-amber-500/20 text-[11px]">
                      {formatTriggerText(rule)}
                    </span>
                    <span className="text-slate-400">THEN</span>
                    <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 font-semibold border border-indigo-500/20 text-[11px]">
                      {formatActionText(rule)}
                    </span>
                  </div>

                  {rule.lastTriggeredAt && (
                    <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Last run: {new Date(rule.lastTriggeredAt).toLocaleString()}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => handleTestRule(rule.id, rule.name)}
                    disabled={testingRuleId === rule.id}
                    className="flex items-center gap-1 px-2.5 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 rounded-xl text-xs font-bold transition disabled:opacity-50"
                    title="Test run rule against board tasks now"
                  >
                    <Play className="w-3 h-3 text-indigo-400" />
                    <span>{testingRuleId === rule.id ? 'Running...' : 'Run Test'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToggleRule(rule.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                      rule.enabled
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                        : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    {rule.enabled ? 'ENABLED' : 'DISABLED'}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteRule(rule.id, rule.name)}
                    className="p-1.5 hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 rounded-xl transition"
                    title="Delete Rule"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Rule Builder Form */}
        <form onSubmit={handleCreateRule} className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-3 shrink-0">
          <div className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
            <Plus className="w-4 h-4 text-amber-400" /> Build New Workflow Rule
          </div>

          <div>
            <label className="block text-[11px] text-slate-400 mb-1 font-semibold">Rule Name / Description</label>
            <input
              type="text"
              required
              placeholder="e.g., Auto-Assign Lead on Review or Move Done Tasks"
              value={ruleName}
              onChange={(e) => setRuleName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Trigger Event (WHEN)</label>
              <select
                value={triggerEvent}
                onChange={(e) => {
                  const ev = e.target.value;
                  setTriggerEvent(ev);
                  if (ev === 'status_changed') setTriggerValue(currentBoard?.columns?.[0]?.id || 'review');
                  else if (ev === 'priority_changed') setTriggerValue('Urgent');
                  else if (ev === 'task_created') setTriggerValue('all');
                  else if (ev === 'tag_added') setTriggerValue('Security');
                }}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-slate-200 focus:outline-none focus:border-amber-500"
              >
                <option value="status_changed">When Task Status Moves To...</option>
                <option value="priority_changed">When Priority Equals...</option>
                <option value="task_created">When New Task is Created</option>
                <option value="tag_added">When Tag is Added...</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Trigger Condition Value</label>
              {triggerEvent === 'status_changed' ? (
                <select
                  value={triggerValue}
                  onChange={(e) => setTriggerValue(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-slate-200 focus:outline-none focus:border-amber-500"
                >
                  {currentBoard?.columns?.map(col => (
                    <option key={col.id} value={col.id}>{col.title} ({col.id})</option>
                  ))}
                </select>
              ) : triggerEvent === 'priority_changed' ? (
                <select
                  value={triggerValue}
                  onChange={(e) => setTriggerValue(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-slate-200 focus:outline-none focus:border-amber-500"
                >
                  <option value="Urgent">Urgent</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              ) : (
                <input
                  type="text"
                  value={triggerValue}
                  onChange={(e) => setTriggerValue(e.target.value)}
                  placeholder="Trigger value (e.g., Security tag)"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-slate-200 focus:outline-none focus:border-amber-500"
                />
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Action Type (THEN)</label>
              <select
                value={actionType}
                onChange={(e) => setActionType(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-slate-200 focus:outline-none focus:border-amber-500"
              >
                <option value="auto_assign">Auto-Assign Member</option>
                <option value="send_notification">Send Notification Alert</option>
                <option value="move_list">Move Task to Column</option>
                <option value="set_priority">Set Task Priority</option>
                <option value="add_tag">Add Tag to Task</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Action Target Value</label>
              {actionType === 'auto_assign' || actionType === 'send_notification' ? (
                <select
                  value={actionValue}
                  onChange={(e) => setActionValue(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-slate-200 focus:outline-none focus:border-amber-500"
                >
                  {allUsers.map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                  ))}
                </select>
              ) : actionType === 'move_list' ? (
                <select
                  value={actionValue}
                  onChange={(e) => setActionValue(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-slate-200 focus:outline-none focus:border-amber-500"
                >
                  {currentBoard?.columns?.map(col => (
                    <option key={col.id} value={col.id}>{col.title} ({col.id})</option>
                  ))}
                </select>
              ) : actionType === 'set_priority' ? (
                <select
                  value={actionValue}
                  onChange={(e) => setActionValue(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-slate-200 focus:outline-none focus:border-amber-500"
                >
                  <option value="Urgent">Urgent</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              ) : (
                <input
                  type="text"
                  value={actionValue}
                  onChange={(e) => setActionValue(e.target.value)}
                  placeholder="e.g. Compliance or Hotfix"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-slate-200 focus:outline-none focus:border-amber-500"
                />
              )}
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-md flex items-center gap-1 transition"
            >
              <Plus className="w-4 h-4" /> Save Automation Rule
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
