import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, subscribeRealtimeEvents } from '../lib/api.js';
import { useAppDispatch, useAppSelector } from '../store/hooks.js';
import {
  fetchBoardsAndTasks,
  selectActiveBoard,
  createNewTask,
  moveTaskPosition,
  updateTaskDetails,
  removeTask,
  createNewBoard,
  deleteExistingBoard,
  optimisticMoveTask,
  taskUpdatedFromSSE,
  taskDeletedFromSSE,
  boardUpdatedFromSSE,
  boardDeletedFromSSE
} from '../store/boardSlice.js';

const BoardContext = createContext(undefined);

export const BoardProvider = ({ children }) => {
  const dispatch = useAppDispatch();
  const reduxBoardState = useAppSelector(state => state.board);

  const boards = reduxBoardState.boards;
  const activeBoard = reduxBoardState.activeBoard;
  const tasks = reduxBoardState.tasks;
  const loading = reduxBoardState.loading;

  const [viewMode, setViewMode] = useState('kanban');
  const [selectedTaskId, setSelectedTaskId] = useState(null);

  // Filters & State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [selectedAssignee, setSelectedAssignee] = useState('all');

  // Modals
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [isCreateBoardOpen, setIsCreateBoardOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isAutomationOpen, setIsAutomationOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [isSecurityAuditOpen, setIsSecurityAuditOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Advanced features
  const [notifications, setNotifications] = useState([]);
  const [capacityMetrics, setCapacityMetrics] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);

  // Matchmaking state
  const [projectPostings, setProjectPostings] = useState([]);
  const [myApplications, setMyApplications] = useState([]);

  // Workspace Real-time Chat
  const [chatMessages, setChatMessages] = useState([]);

  // Toast UI
  const [toasts, setToasts] = useState([]);

  const addToast = (title, message, type = 'info') => {
    const id = `toast_${Date.now()}`;
    setToasts(prev => [...prev, { id, title, message, type }]);
    setTimeout(() => removeToast(id), 5000);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Load Boards & Tasks via Redux Async Thunks
  const loadBoardsAndTasks = async () => {
    try {
      await dispatch(fetchBoardsAndTasks(activeBoard?.id)).unwrap();
      if (activeBoard) {
        const capRes = await api.getCapacityMetrics(activeBoard.id).catch(() => ({ metrics: [] }));
        setCapacityMetrics(capRes.metrics || []);
        const chatRes = await api.getChatMessages(activeBoard.id).catch(() => ({ messages: [] }));
        setChatMessages(chatRes.messages || []);
      }
      const secRes = await api.getSecurityLogs().catch(() => ({ logs: [] }));
      setAuditLogs(secRes.logs || []);
      await fetchMatchmakingData();
    } catch (err) {
      console.error('Failed to load board data via Redux:', err);
    }
  };

  const fetchMatchmakingData = async () => {
    try {
      const [postingsRes, appsRes] = await Promise.all([
        api.getPostings().catch(() => ({ postings: [] })),
        api.getApplications().catch(() => ({ applications: [] }))
      ]);
      setProjectPostings(postingsRes.postings || []);
      setMyApplications(appsRes.applications || []);
    } catch (err) {
      console.error('Error loading matchmaking data:', err);
    }
  };

  useEffect(() => {
    loadBoardsAndTasks();
  }, []);

  // Subscribe to SSE Real-time events
  useEffect(() => {
    const unsubscribe = subscribeRealtimeEvents((event, payload) => {
      if (event === 'task_updated') {
        dispatch(taskUpdatedFromSSE(payload));
      } else if (event === 'task_deleted') {
        dispatch(taskDeletedFromSSE(payload.id));
      } else if (event === 'board_updated') {
        dispatch(boardUpdatedFromSSE(payload));
      } else if (event === 'board_deleted') {
        dispatch(boardDeletedFromSSE(payload));
      } else if (event === 'task_created') {
        if (activeBoard && payload.boardId === activeBoard.id) {
          dispatch(taskUpdatedFromSSE(payload));
        }
      } else if (event === 'posting_created' || event === 'posting_updated') {
        fetchMatchmakingData();
      } else if (event === 'chat_message') {
        if (activeBoard && payload.boardId === activeBoard.id) {
          setChatMessages(prev => [...prev, payload]);
        }
      }
    });

    return () => unsubscribe();
  }, [activeBoard, dispatch]);

  const setActiveBoardId = async (id) => {
    try {
      await dispatch(selectActiveBoard(id)).unwrap();
      const capRes = await api.getCapacityMetrics(id).catch(() => ({ metrics: [] }));
      setCapacityMetrics(capRes.metrics || []);
      const chatRes = await api.getChatMessages(id).catch(() => ({ messages: [] }));
      setChatMessages(chatRes.messages || []);
    } catch (err) {
      console.error('Error switching board:', err);
    }
  };

  // Redux Actions
  const createTask = async (taskData) => {
    const created = await dispatch(createNewTask(taskData)).unwrap();
    addToast('Task Created', `Created "${created.title}"`, 'success');
    if (activeBoard) {
      api.getCapacityMetrics(activeBoard.id).then(r => setCapacityMetrics(r.metrics));
    }
    return created;
  };

  const moveTask = async (taskId, targetListId, position) => {
    dispatch(optimisticMoveTask({ taskId, targetListId, position }));
    try {
      await dispatch(moveTaskPosition({ taskId, targetListId, position })).unwrap();
      if (activeBoard) {
        api.getCapacityMetrics(activeBoard.id).then(r => setCapacityMetrics(r.metrics));
      }
    } catch (err) {
      console.error('Move task error:', err);
    }
  };

  const updateTask = async (taskId, taskData) => {
    try {
      await dispatch(updateTaskDetails({ taskId, updates: taskData })).unwrap();
      if (activeBoard) {
        api.getCapacityMetrics(activeBoard.id).then(r => setCapacityMetrics(r.metrics));
      }
    } catch (err) {
      console.error('Update task error:', err);
    }
  };

  const deleteTask = async (taskId) => {
    try {
      await dispatch(removeTask(taskId)).unwrap();
      addToast('Task Deleted', 'Card deleted successfully', 'info');
      if (activeBoard) {
        api.getCapacityMetrics(activeBoard.id).then(r => setCapacityMetrics(r.metrics));
      }
    } catch (err) {
      console.error('Delete task error:', err);
    }
  };

  const createBoard = async (data) => {
    const created = await dispatch(createNewBoard(data)).unwrap();
    addToast('Board Created', `Created workspace "${created.name}"`, 'success');
    return created;
  };

  const deleteBoard = async (boardId) => {
    const targetId = boardId || activeBoard?.id;
    if (!targetId) return;

    const boardToDelete = boards.find(b => b.id === targetId);
    const boardName = boardToDelete ? boardToDelete.name : 'Workspace';

    try {
      await dispatch(deleteExistingBoard(targetId)).unwrap();
      addToast('Workspace Deleted', `Deleted "${boardName}" successfully`, 'info');
    } catch (err) {
      addToast('Delete Failed', err.message || 'Failed to delete workspace', 'error');
    }
  };

  // Matchmaking Actions
  const createProjectPosting = async (data) => {
    const res = await api.createPosting(data);
    await fetchMatchmakingData();
    const createdBoardId = res.posting?.boardId || res.posting?.createdBoardId;
    if (data.createWorkspace && createdBoardId) {
      await loadBoardsAndTasks();
      await setActiveBoardId(createdBoardId);
    }
    addToast('Listing Published', `Matchmaking posting for "${res.posting.title}" is live!`, 'success');
    return res.posting;
  };

  const applyToProject = async (projectId, pitchMessage, roleRequested) => {
    const res = await api.applyToProject(projectId, pitchMessage, roleRequested);
    setMyApplications(prev => [...prev, res.application]);
    addToast('Application Submitted', 'Your pitch has been routed to team leads.', 'success');
    return res.application;
  };

  const updateApplicationStatus = async (id, status) => {
    try {
      const res = await api.updateApplicationStatus(id, status);
      await fetchMatchmakingData();
      await loadBoardsAndTasks();
      if (status === 'Accepted') {
        addToast(
          'Member Accepted!',
          `${res.application?.applicantName || 'Applicant'} has been accepted and added to the team workspace!`,
          'success'
        );
      } else {
        addToast('Application Declined', 'The application status has been updated.', 'info');
      }
      return res.application;
    } catch (err) {
      console.error('Failed to update application status:', err);
      addToast('Status Update Failed', err.message || 'Could not update application status.', 'error');
      throw err;
    }
  };

  // Workspace Realtime Chat
  const sendChatMessage = async (message) => {
    if (!activeBoard) return;
    const res = await api.sendChatMessage(activeBoard.id, message);
    setChatMessages(prev => [...prev, res.message]);
  };

  const filteredTasks = tasks.filter(t => {
    if (searchQuery && !t.title.toLowerCase().includes(searchQuery.toLowerCase()) && !t.description.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (selectedPriority !== 'all' && t.priority.toLowerCase() !== selectedPriority.toLowerCase()) {
      return false;
    }
    if (selectedAssignee !== 'all' && !t.assignees.includes(selectedAssignee)) {
      return false;
    }
    return true;
  });

  return (
    <BoardContext.Provider
      value={{
        boards,
        activeBoard,
        tasks: filteredTasks,
        allRawTasks: tasks,
        loading,
        viewMode,
        setViewMode,
        selectedTaskId,
        setSelectedTaskId,
        searchQuery,
        setSearchQuery,
        selectedPriority,
        setSelectedPriority,
        selectedAssignee,
        setSelectedAssignee,
        isCreateTaskOpen,
        setIsCreateTaskOpen,
        isCreateBoardOpen,
        setIsCreateBoardOpen,
        isAiModalOpen,
        setIsAiModalOpen,
        isAutomationOpen,
        setIsAutomationOpen,
        isAutomationModalOpen: isAutomationOpen,
        setIsAutomationModalOpen: setIsAutomationOpen,
        isAnalyticsOpen,
        setIsAnalyticsOpen,
        isSecurityAuditOpen,
        setIsSecurityAuditOpen,
        isSecurityModalOpen: isSecurityAuditOpen,
        setIsSecurityModalOpen: setIsSecurityAuditOpen,
        isNotificationsOpen,
        setIsNotificationsOpen,
        notifications,
        capacityMetrics,
        auditLogs,
        projectPostings,
        postings: projectPostings,
        myApplications,
        applications: myApplications,
        chatMessages,
        toasts,
        addToast,
        removeToast,
        setActiveBoardId,
        createTask,
        moveTask,
        updateTask,
        deleteTask,
        createBoard,
        deleteBoard,
        createProjectPosting,
        createPosting: createProjectPosting,
        applyToProject,
        updateApplicationStatus,
        respondToApplication: updateApplicationStatus,
        sendChatMessage,
        refreshData: loadBoardsAndTasks
      }}
    >
      {children}
    </BoardContext.Provider>
  );
};

export const useBoard = () => {
  const context = useContext(BoardContext);
  if (!context) {
    throw new Error('useBoard must be used within a BoardProvider');
  }
  return context;
};
