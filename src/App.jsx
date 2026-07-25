import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { BoardProvider, useBoard } from './context/BoardContext';
import { Sidebar } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';
import { BottomRail } from './components/BottomRail';
import { KanbanView } from './components/views/KanbanView';
import { CalendarView } from './components/views/CalendarView';
import { TableView } from './components/views/TableView';
import { GanttView } from './components/views/GanttView';
import { MatchmakingHubView } from './components/views/MatchmakingHubView';
import { TeamChatView } from './components/views/TeamChatView';
import { TaskDetailModal } from './components/modals/TaskDetailModal';
import { AiAssistantModal } from './components/modals/AiAssistantModal';
import { AutomationModal } from './components/modals/AutomationModal';
import { SecurityAuditModal } from './components/modals/SecurityAuditModal';
import { CapacityAnalytics } from './components/analytics/CapacityAnalytics';
import { NotificationDrawer } from './components/notifications/NotificationDrawer';
import { LoginModal } from './components/modals/LoginModal';

const MainWorkspaceContent = () => {
  const { viewMode, loading } = useBoard();

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-[#0f172a]">
        <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs font-mono font-semibold text-slate-300">Loading Task & Project Matrix...</p>
      </div>
    );
  }

  return (
    <main className="flex-1 bg-[#0f172a] text-slate-100 overflow-y-auto">
      {viewMode === 'kanban' && <KanbanView />}
      {viewMode === 'calendar' && <CalendarView />}
      {viewMode === 'table' && <TableView />}
      {viewMode === 'gantt' && <GanttView />}
      {viewMode === 'matchmaking' && <MatchmakingHubView />}
      {viewMode === 'chat' && <TeamChatView />}

      {/* Modals & Drawers */}
      <TaskDetailModal />
      <AiAssistantModal />
      <AutomationModal />
      <SecurityAuditModal />
      <CapacityAnalytics />
      <NotificationDrawer />
      <LoginModal />
    </main>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <BoardProvider>
        <div className="flex h-screen w-full bg-[#0f172a] text-slate-300 font-sans overflow-hidden selection:bg-indigo-500 selection:text-white">
          <Sidebar />
          <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
            <TopHeader />
            <MainWorkspaceContent />
            <BottomRail />
          </div>
        </div>
      </BoardProvider>
    </AuthProvider>
  );
}
