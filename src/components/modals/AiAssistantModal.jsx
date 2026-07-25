import React, { useState } from 'react';
import { X, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useBoard } from '../../context/BoardContext.jsx';
import { api } from '../../lib/api.js';

export const AiAssistantModal = () => {
  const { isAiModalOpen, setIsAiModalOpen, createTask, activeBoard } = useBoard();

  const [promptInput, setPromptInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  if (!isAiModalOpen) return null;

  const handleDecompose = async (e) => {
    e.preventDefault();
    if (!promptInput.trim()) return;

    setLoading(true);
    try {
      const res = await api.decomposeTask(promptInput);
      setResult(res.result);
    } catch (err) {
      console.error('Decomposition error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptAndCreate = async () => {
    if (!result || !activeBoard) return;

    await createTask({
      title: result.title,
      description: result.suggestedDescription,
      priority: result.suggestedPriority,
      tags: result.suggestedTags,
      estimatedHours: result.estimatedTimeHours,
      subtasks: result.subtasks.map((s, idx) => ({
        id: `sub_ai_${Date.now()}_${idx}`,
        title: s.title,
        completed: false,
        estimatedHours: s.estimatedHours
      })),
      listId: 'todo'
    });

    setPromptInput('');
    setResult(null);
    setIsAiModalOpen(false);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">SubPilot Gemini AI Assistant</h3>
              <p className="text-xs text-slate-400">Automated task decomposition and technical spec generator</p>
            </div>
          </div>

          <button
            onClick={() => setIsAiModalOpen(false)}
            className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleDecompose} className="space-y-4 mb-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              High-Level Task or Feature Objective
            </label>
            <textarea
              required
              rows={3}
              placeholder="e.g., Build task automation rules and notifications pipeline"
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-2xl p-3.5 text-sm text-slate-200 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading || !promptInput.trim()}
              className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-500/20 flex items-center gap-2 disabled:opacity-50 transition"
            >
              <Sparkles className={`w-4 h-4 text-amber-300 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Decomposing via Gemini...' : 'Decompose Objective'}</span>
            </button>
          </div>
        </form>

        {result && (
          <div className="bg-slate-800/80 border border-purple-500/30 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-white">{result.title}</h4>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {result.suggestedPriority} Priority
              </span>
            </div>

            <p className="text-xs text-slate-300">{result.suggestedDescription}</p>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium">Estimated: {result.estimatedTimeHours} hours</span>
              <div className="flex items-center gap-1">
                {(result.suggestedTags || []).map((t, i) => (
                  <span key={i} className="text-[10px] bg-slate-700 text-slate-300 px-2 py-0.5 rounded-md">
                    #{t}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <div className="text-xs font-bold text-slate-400 mb-2">Generated Checklist Steps:</div>
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {(result.subtasks || []).map((sub, i) => (
                  <div key={i} className="bg-slate-900/80 p-2 rounded-xl text-xs text-slate-200 flex items-center justify-between border border-slate-700/60">
                    <span className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      {sub.title}
                    </span>
                    <span className="text-[10px] text-slate-400">{sub.estimatedHours}h</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={handleAcceptAndCreate}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5"
              >
                <span>Add Task to Board</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
