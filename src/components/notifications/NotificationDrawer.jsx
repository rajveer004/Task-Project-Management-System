import React from 'react';
import { X, Bell, Sparkles } from 'lucide-react';
import { useBoard } from '../../context/BoardContext.jsx';

export const NotificationDrawer = () => {
  const { isNotificationOpen, setIsNotificationOpen, toasts, removeToast } = useBoard();

  if (!isNotificationOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            onClick={() => removeToast(toast.id)}
            className="pointer-events-auto bg-slate-900 border border-slate-700/80 rounded-2xl p-3.5 shadow-2xl flex items-start gap-3 cursor-pointer"
          >
            <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
            <div>
              <div className="text-xs font-bold text-white mb-0.5">{toast.title}</div>
              <div className="text-xs text-slate-300">{toast.message}</div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/40 backdrop-blur-xs">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-slate-900 border-l border-slate-800 p-6 shadow-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-base text-white">Notifications Center</h3>
              </div>
              <button
                onClick={() => setIsNotificationOpen(false)}
                className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/60">
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-300 mb-1">
                  <Sparkles className="w-3.5 h-3.5" /> Real-time Sync Active
                </div>
                <p className="text-xs text-slate-300">
                  You are connected to the SubPilot Server-Sent Event stream. Board card moves, activity logs, and security notifications stream live.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 text-center">
            <button
              onClick={() => setIsNotificationOpen(false)}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 rounded-xl"
            >
              Close Drawer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
