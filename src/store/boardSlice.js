import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../lib/api.js';

const initialState = {
  boards: [],
  activeBoard: null,
  tasks: [],
  users: [],
  notifications: [],
  activeView: 'kanban',
  loading: false,
  error: null,
  searchQuery: '',
  selectedPriority: 'all',
  selectedAssignee: 'all',
  selectedTaskId: null,
  isCreateTaskOpen: false,
  isCreateBoardOpen: false,
};

// Async Thunks for Express CRUD APIs
export const fetchBoardsAndTasks = createAsyncThunk(
  'board/fetchBoardsAndTasks',
  async (targetBoardId) => {
    const boardsRes = await api.getBoards();
    const boards = boardsRes.boards || [];
    const active = boards.find(b => b.id === targetBoardId) || boards[0] || null;

    let tasks = [];
    if (active) {
      const tasksRes = await api.getTasks(active.id);
      tasks = tasksRes.tasks || [];
    }

    const usersRes = await api.getUsers().catch(() => ({ users: [] }));
    return { boards, activeBoard: active, tasks, users: usersRes.users || [] };
  }
);

export const selectActiveBoard = createAsyncThunk(
  'board/selectActiveBoard',
  async (boardId, { getState }) => {
    const state = getState();
    const targetBoard = state.board.boards.find(b => b.id === boardId) || null;
    let tasks = [];
    if (targetBoard) {
      const tasksRes = await api.getTasks(targetBoard.id);
      tasks = tasksRes.tasks || [];
    }
    return { activeBoard: targetBoard, tasks };
  }
);

export const createNewTask = createAsyncThunk(
  'board/createNewTask',
  async (taskData, { getState }) => {
    const state = getState();
    const boardId = taskData.boardId || state.board.activeBoard?.id;
    if (!boardId) throw new Error('No active board selected');

    const listId = taskData.listId || state.board.activeBoard?.columns[0]?.id || 'todo';
    const payload = {
      ...taskData,
      boardId,
      listId,
      title: taskData.title || 'New Task',
      description: taskData.description || '',
      priority: taskData.priority || 'Medium',
      tags: taskData.tags || ['Feature'],
      assignees: taskData.assignees || [],
      dueDate: taskData.dueDate || new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0]
    };

    const res = await api.createTask(payload);
    return res.task;
  }
);

export const moveTaskPosition = createAsyncThunk(
  'board/moveTaskPosition',
  async ({ taskId, targetListId, position }) => {
    const res = await api.updateTask(taskId, { listId: targetListId, position });
    return res.task;
  }
);

export const updateTaskDetails = createAsyncThunk(
  'board/updateTaskDetails',
  async ({ taskId, updates }) => {
    const res = await api.updateTask(taskId, updates);
    return res.task;
  }
);

export const removeTask = createAsyncThunk(
  'board/removeTask',
  async (taskId) => {
    await api.deleteTask(taskId);
    return taskId;
  }
);

export const createNewBoard = createAsyncThunk(
  'board/createNewBoard',
  async (data) => {
    const res = await api.createBoard(data);
    return res.board;
  }
);

export const deleteExistingBoard = createAsyncThunk(
  'board/deleteExistingBoard',
  async (boardId, { getState }) => {
    await api.deleteBoard(boardId);
    const boardsRes = await api.getBoards();
    const boards = boardsRes.boards || [];

    const state = getState();
    let nextBoardId = state.board.activeBoard?.id;
    if (nextBoardId === boardId) {
      nextBoardId = boards[0]?.id || null;
    }

    let tasks = [];
    if (nextBoardId) {
      const tasksRes = await api.getTasks(nextBoardId).catch(() => ({ tasks: [] }));
      tasks = tasksRes.tasks || [];
    }

    const nextActiveBoard = boards.find(b => b.id === nextBoardId) || boards[0] || null;
    return { boards, deletedId: boardId, nextActiveBoard, tasks };
  }
);

export const createNewList = createAsyncThunk(
  'board/createNewList',
  async ({ boardId, title, color }) => {
    const res = await api.createColumn(boardId, title, color);
    return res.board;
  }
);

const boardSlice = createSlice({
  name: 'board',
  initialState,
  reducers: {
    setViewMode: (state, action) => {
      state.activeView = action.payload;
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    setSelectedPriority: (state, action) => {
      state.selectedPriority = action.payload;
    },
    setSelectedAssignee: (state, action) => {
      state.selectedAssignee = action.payload;
    },
    setSelectedTaskId: (state, action) => {
      state.selectedTaskId = action.payload;
    },
    setCreateTaskOpen: (state, action) => {
      state.isCreateTaskOpen = action.payload;
    },
    setCreateBoardOpen: (state, action) => {
      state.isCreateBoardOpen = action.payload;
    },
    optimisticMoveTask: (state, action) => {
      const { taskId, targetListId, position } = action.payload;
      const task = state.tasks.find(t => t.id === taskId);
      if (task) {
        task.listId = targetListId;
        if (position !== undefined) task.position = position;
      }
    },
    taskUpdatedFromSSE: (state, action) => {
      const index = state.tasks.findIndex(t => t.id === action.payload.id);
      if (index >= 0) {
        state.tasks[index] = action.payload;
      } else if (state.activeBoard && action.payload.boardId === state.activeBoard.id) {
        state.tasks.unshift(action.payload);
      }
    },
    taskDeletedFromSSE: (state, action) => {
      state.tasks = state.tasks.filter(t => t.id !== action.payload);
    },
    boardUpdatedFromSSE: (state, action) => {
      const idx = state.boards.findIndex(b => b.id === action.payload.id);
      if (idx >= 0) state.boards[idx] = action.payload;
      if (state.activeBoard?.id === action.payload.id) {
        state.activeBoard = action.payload;
      }
    },
    boardDeletedFromSSE: (state, action) => {
      const deletedId = action.payload?.id || action.payload;
      state.boards = state.boards.filter(b => b.id !== deletedId);
      if (state.activeBoard?.id === deletedId) {
        state.activeBoard = state.boards[0] || null;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBoardsAndTasks.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchBoardsAndTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.boards = action.payload.boards;
        state.activeBoard = action.payload.activeBoard;
        state.tasks = action.payload.tasks;
        state.users = action.payload.users;
      })
      .addCase(selectActiveBoard.fulfilled, (state, action) => {
        state.activeBoard = action.payload.activeBoard;
        state.tasks = action.payload.tasks;
      })
      .addCase(createNewTask.fulfilled, (state, action) => {
        state.tasks.unshift(action.payload);
      })
      .addCase(moveTaskPosition.fulfilled, (state, action) => {
        const idx = state.tasks.findIndex(t => t.id === action.payload.id);
        if (idx >= 0) state.tasks[idx] = action.payload;
      })
      .addCase(updateTaskDetails.fulfilled, (state, action) => {
        const idx = state.tasks.findIndex(t => t.id === action.payload.id);
        if (idx >= 0) state.tasks[idx] = action.payload;
      })
      .addCase(removeTask.fulfilled, (state, action) => {
        state.tasks = state.tasks.filter(t => t.id !== action.payload);
        if (state.selectedTaskId === action.payload) {
          state.selectedTaskId = null;
        }
      })
      .addCase(createNewBoard.fulfilled, (state, action) => {
        state.boards.push(action.payload);
        state.activeBoard = action.payload;
        state.tasks = [];
      })
      .addCase(deleteExistingBoard.fulfilled, (state, action) => {
        state.boards = action.payload.boards;
        state.activeBoard = action.payload.nextActiveBoard;
        state.tasks = action.payload.tasks;
      })
      .addCase(createNewList.fulfilled, (state, action) => {
        const idx = state.boards.findIndex(b => b.id === action.payload.id);
        if (idx >= 0) state.boards[idx] = action.payload;
        if (state.activeBoard?.id === action.payload.id) {
          state.activeBoard = action.payload;
        }
      });
  },
});

export const {
  setViewMode,
  setSearchQuery,
  setSelectedPriority,
  setSelectedAssignee,
  setSelectedTaskId,
  setCreateTaskOpen,
  setCreateBoardOpen,
  optimisticMoveTask,
  taskUpdatedFromSSE,
  taskDeletedFromSSE,
  boardUpdatedFromSSE,
  boardDeletedFromSSE
} = boardSlice.actions;

export default boardSlice.reducer;
