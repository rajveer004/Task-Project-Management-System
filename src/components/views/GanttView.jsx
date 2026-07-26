import React from 'react';
import { GanttChart } from 'lucide-react';
import { useBoard } from '../../context/BoardContext.jsx';

export const GanttView = () => {
  const { tasks, activeBoard, setSelectedTaskId } = useBoard();

  if (!activeBoard) return null;

  const today = new Date();
  const daysInTimeline = 21;
  const timelineDates = [];

  for (let i = -3; i < daysInTimeline - 3; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    timelineDates.push(d);
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Urgent': return 'bg-red-500 border-red-400';
      case 'High': return 'bg-amber-500 border-amber-400';
      case 'Medium': return 'bg-indigo-600 border-indigo-400';
      default: return 'bg-slate-600 border-slate-500';
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-[1700px] mx-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-4 flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-3">
          <GanttChart className="w-5 h-5 text-indigo-400" />
          <h2 className="text-base font-bold text-white">Gantt & Timeline Roadmapping</h2>
        </div>
        <div className="text-xs text-slate-400 font-medium">
          Inspect milestone deadlines and team schedules
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <div className="min-w-[1200px]">
            <div className="flex border-b border-slate-800 bg-slate-950/80 text-xs font-bold text-slate-400">
              <div className="w-64 p-3 border-r border-slate-800 shrink-0">Task Name</div>
              <div className="w-24 p-3 border-r border-slate-800 shrink-0 text-center">Status</div>
              <div className="flex-1 grid grid-cols-21 divide-x divide-slate-800/80">
                {timelineDates.map((date, i) => {
                  const isToday = date.toDateString() === new Date().toDateString();
                  return (
                    <div
                      key={i}
                      className={`p-2 text-center text-[10px] ${
                        isToday ? 'bg-indigo-600/30 font-bold text-indigo-300' : ''
                      }`}
                    >
                      <div>{date.toLocaleDateString('en-US', { weekday: 'narrow' })}</div>
                      <div className="text-slate-300 font-semibold">{date.getDate()}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="divide-y divide-slate-800/60">
              {tasks.map(task => {
                const column = activeBoard.columns.find(c => c.id === task.listId);
                const completedSubtasks = task.subtasks?.filter(s => s.completed).length || 0;
                const totalSubtasks = task.subtasks?.length || 0;
                const progressPct = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 50;

                let startColIndex = 3;
                let durationDays = 4;

                if (task.dueDate) {
                  const due = new Date(task.dueDate);
                  const diffDays = Math.floor((due.getTime() - today.getTime()) / (1000 * 3600 * 24)) + 3;
                  if (diffDays >= 0 && diffDays < daysInTimeline) {
                    startColIndex = Math.max(0, diffDays - 3);
                    durationDays = 4;
                  }
                }

                return (
                  <div key={task.id} className="flex hover:bg-slate-800/40 transition items-center">
                    <div
                      onClick={() => setSelectedTaskId(task.id)}
                      className="w-64 p-3 border-r border-slate-800 shrink-0 font-semibold text-xs text-slate-200 cursor-pointer hover:text-indigo-400 truncate"
                    >
                      {task.title}
                    </div>

                    <div className="w-24 p-2 border-r border-slate-800 shrink-0 text-center">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-semibold border border-slate-700">
                        {column?.title || 'Backlog'}
                      </span>
                    </div>

                    <div className="flex-1 grid grid-cols-21 divide-x divide-slate-800/30 relative py-2.5 px-1">
                      {timelineDates.map((_, idx) => (
                        <div key={idx} className="h-8 border-slate-800/30" />
                      ))}

                      <div
                        onClick={() => setSelectedTaskId(task.id)}
                        className={`absolute top-2.5 h-8 rounded-lg shadow-md border cursor-pointer flex items-center px-2 text-xs font-bold text-white transition hover:brightness-110 ${getPriorityColor(task.priority)}`}
                        style={{
                          left: `${(startColIndex / daysInTimeline) * 100}%`,
                          width: `${(durationDays / daysInTimeline) * 100}%`
                        }}
                      >
                        <div className="truncate text-[11px] flex items-center justify-between w-full">
                          <span>{task.title}</span>
                          <span className="text-[9px] bg-black/30 px-1 py-0.2 rounded font-normal">
                            {progressPct}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
