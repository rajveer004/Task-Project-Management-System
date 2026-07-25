import React from 'react';
import {
  X,
  AlertTriangle,
  BarChart2,
  TrendingUp,
  Users
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { useBoard } from '../../context/BoardContext.jsx';

export const CapacityAnalytics = () => {
  const { isAnalyticsOpen, setIsAnalyticsOpen, capacityMetrics } = useBoard();

  if (!isAnalyticsOpen) return null;

  const barData = capacityMetrics.map(m => ({
    name: m.user.name,
    Active: m.activeTasks,
    Completed: m.completedTasks,
    Limit: m.capacityLimit
  }));

  const overloadedUsers = capacityMetrics.filter(m => m.isOverloaded);

  const pieData = [
    { name: 'Completed', value: capacityMetrics.reduce((acc, m) => acc + m.completedTasks, 0), color: '#22C55E' },
    { name: 'Active Tasks', value: capacityMetrics.reduce((acc, m) => acc + m.activeTasks, 0), color: '#3B82F6' },
    { name: 'Overdue', value: capacityMetrics.reduce((acc, m) => acc + m.overdueTasks, 0), color: '#EF4444' }
  ];

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <BarChart2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">Team Workload & Capacity Analytics</h3>
              <p className="text-xs text-slate-400">Real-time velocity tracking and burnout indicator</p>
            </div>
          </div>

          <button
            onClick={() => setIsAnalyticsOpen(false)}
            className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {overloadedUsers.length > 0 && (
          <div className="bg-amber-950/40 border border-amber-500/50 rounded-2xl p-4 mb-6 flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0" />
            <div>
              <div className="text-xs font-bold text-amber-300">
                Capacity Warning: {overloadedUsers.length} Team Member(s) Overloaded
              </div>
              <div className="text-xs text-slate-300">
                {overloadedUsers.map(u => `${u.user.name} (${u.activeTasks} active tasks / limit ${u.capacityLimit})`).join(', ')}. Consider reassigning cards to balance team load.
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4">
            <h4 className="text-xs font-bold text-slate-200 mb-3 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-indigo-400" /> Workload per Team Member
            </h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
                  <YAxis stroke="#94a3b8" fontSize={10} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '11px' }} />
                  <Bar dataKey="Active" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Completed" fill="#22C55E" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4">
            <h4 className="text-xs font-bold text-slate-200 mb-3 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-400" /> Task Status Distribution
            </h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '11px' }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
