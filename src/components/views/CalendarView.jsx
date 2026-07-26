import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus } from 'lucide-react';
import { useBoard } from '../../context/BoardContext.jsx';

export const CalendarView = () => {
  const { tasks, setSelectedTaskId, createTask, activeBoard } = useBoard();

  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const today = () => setCurrentDate(new Date());

  const daysGrid = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    daysGrid.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    daysGrid.push(d);
  }

  const getPriorityBadgeClass = (priority) => {
    switch (priority) {
      case 'Urgent': return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'High': return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'Medium': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      default: return 'bg-slate-700 text-slate-300';
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-[1600px] mx-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-4 flex items-center justify-between flex-wrap gap-3 shadow-xl">
        <div className="flex items-center gap-3">
          <CalendarIcon className="w-5 h-5 text-indigo-400" />
          <h2 className="text-lg font-bold text-white">
            {monthNames[month]} {year}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={today}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 rounded-lg border border-slate-700 transition"
          >
            Today
          </button>
          <button
            onClick={prevMonth}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={nextMonth}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-2 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">
        <div>Sun</div>
        <div>Mon</div>
        <div>Tue</div>
        <div>Wed</div>
        <div>Thu</div>
        <div>Fri</div>
        <div>Sat</div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {daysGrid.map((dayNumber, idx) => {
          if (dayNumber === null) {
            return <div key={`empty_${idx}`} className="bg-slate-950/40 rounded-xl min-h-[120px] p-2 border border-slate-800/40 opacity-40" />;
          }

          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNumber).padStart(2, '0')}`;
          const isToday = new Date().toISOString().startsWith(dateStr);

          const dayTasks = tasks.filter(t => t.dueDate === dateStr);

          return (
            <div
              key={`day_${dayNumber}`}
              className={`bg-slate-900 border rounded-xl p-2.5 min-h-[130px] flex flex-col justify-between transition ${
                isToday ? 'border-indigo-500/80 bg-indigo-950/10 ring-1 ring-indigo-500/30' : 'border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    isToday ? 'bg-indigo-600 text-white' : 'text-slate-400 bg-slate-800'
                  }`}>
                    {dayNumber}
                  </span>

                  <button
                    onClick={() => {
                      if (activeBoard) {
                        createTask({
                          title: 'New Calendar Task',
                          dueDate: dateStr,
                          priority: 'Medium'
                        });
                      }
                    }}
                    className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition"
                    title="Quick add task on this date"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-1.5 overflow-y-auto max-h-[100px]">
                  {dayTasks.map(task => (
                    <div
                      key={task.id}
                      onClick={() => setSelectedTaskId(task.id)}
                      className="bg-slate-800 hover:bg-slate-700/80 p-1.5 rounded-lg border border-slate-700/60 text-xs cursor-pointer transition shadow-sm"
                    >
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold border ${getPriorityBadgeClass(task.priority)}`}>
                          {task.priority}
                        </span>
                      </div>
                      <div className="font-semibold text-slate-200 text-[11px] truncate">{task.title}</div>
                    </div>
                  ))}
                </div>
              </div>

              {dayTasks.length > 3 && (
                <div className="text-[10px] text-indigo-400 font-semibold text-right pt-1">
                  +{dayTasks.length - 3} more
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
