import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Plus, Clock, Paperclip } from 'lucide-react';
import { useBoard } from '../../context/BoardContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

export const KanbanView = () => {
  const {
    activeBoard,
    tasks,
    moveTask,
    createTask,
    setSelectedTaskId,
    searchQuery,
    selectedPriority,
    selectedAssignee
  } = useBoard();

  const { allUsers } = useAuth();

  const [newTaskColumnId, setNewTaskColumnId] = useState(null);
  const [quickTitle, setQuickTitle] = useState('');

  if (!activeBoard) {
    return <div className="p-8 text-center text-slate-400">No active workspace board found.</div>;
  }

  const filteredTasks = tasks.filter(task => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchTitle = task.title.toLowerCase().includes(q);
      const matchDesc = task.description.toLowerCase().includes(q);
      const matchTags = task.tags.some(t => t.toLowerCase().includes(q));
      if (!matchTitle && !matchDesc && !matchTags) return false;
    }
    if (selectedPriority !== 'all' && task.priority !== selectedPriority) return false;
    if (selectedAssignee !== 'all' && !task.assignees.includes(selectedAssignee)) return false;
    return true;
  });

  const handleDragEnd = (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    moveTask(draggableId, destination.droppableId, destination.index);
  };

  const handleQuickAdd = async (columnId) => {
    if (!quickTitle.trim()) return;
    await createTask({
      title: quickTitle,
      listId: columnId,
      priority: 'Medium',
      tags: ['Task']
    });
    setQuickTitle('');
    setNewTaskColumnId(null);
  };

  const getPriorityBadgeClass = (priority) => {
    switch (priority) {
      case 'Urgent':
        return 'bg-rose-900/90 text-rose-200 border-rose-700/50';
      case 'High':
        return 'bg-amber-900/90 text-amber-200 border-amber-700/50';
      case 'Medium':
        return 'bg-cyan-900/90 text-cyan-200 border-cyan-700/50';
      default:
        return 'bg-slate-700 text-slate-300 border-slate-600';
    }
  };

  return (
    <div className="p-4 sm:p-6 min-h-full">
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-6 items-start snap-x">
          {activeBoard.columns.map(column => {
            const columnTasks = filteredTasks
              .filter(t => t.listId === column.id)
              .sort((a, b) => a.position - b.position);

            const isOverLimit = column.limit && columnTasks.length > column.limit;

            return (
              <div
                key={column.id}
                className="w-80 sm:w-84 shrink-0 bg-[#020617]/80 border border-slate-800 rounded-xl flex flex-col max-h-[calc(100vh-140px)] shadow-lg"
              >
                {/* Column Header */}
                <div className="p-3 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: column.color || '#3B82F6' }}
                    />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2 font-mono">
                      <span>{column.title}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                        isOverLimit ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {columnTasks.length.toString().padStart(2, '0')} {column.limit ? `/ ${column.limit}` : ''}
                      </span>
                    </h3>
                  </div>

                  <button
                    onClick={() => setNewTaskColumnId(column.id)}
                    className="p-1 hover:bg-slate-800 rounded text-slate-500 hover:text-slate-200 transition"
                    title="Add task to column"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Droppable Task List */}
                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`p-2.5 space-y-2.5 overflow-y-auto flex-1 transition-colors min-h-[160px] ${
                        snapshot.isDraggingOver ? 'bg-indigo-950/20 rounded-lg' : ''
                      }`}
                    >
                      {columnTasks.map((task, index) => {
                        const completedSubtasks = task.subtasks?.filter(s => s.completed).length || 0;
                        const totalSubtasks = task.subtasks?.length || 0;
                        const taskIdFormatted = `TASK-${task.id.replace(/^task_?/i, '').padStart(2, '0')}`;

                        return (
                          <Draggable key={task.id} draggableId={task.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                onClick={() => setSelectedTaskId(task.id)}
                                className={`bg-[#1e293b] border rounded-lg p-3 shadow-sm cursor-pointer transition duration-150 group relative ${
                                  snapshot.isDragging
                                    ? 'shadow-2xl ring-2 ring-indigo-500 scale-105 z-50 bg-[#1e293b] border-indigo-500'
                                    : task.priority === 'Urgent'
                                    ? 'border-indigo-500/40 hover:border-indigo-400 ring-1 ring-indigo-500/20'
                                    : 'border-slate-700/80 hover:border-slate-600'
                                }`}
                              >
                                {task.priority === 'Urgent' && (
                                  <div className="absolute top-2.5 right-2.5 flex gap-1">
                                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                  </div>
                                )}

                                {task.coverImage && (
                                  <div className="mb-2 rounded-md overflow-hidden h-24 relative">
                                    <img src={task.coverImage} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                                  </div>
                                )}

                                <div className="flex items-center justify-between gap-2 mb-2">
                                  <span className="text-[10px] font-mono text-indigo-400 bg-indigo-400/10 px-1.5 py-0.5 rounded font-semibold">
                                    {taskIdFormatted}
                                  </span>

                                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wide border ${getPriorityBadgeClass(task.priority)}`}>
                                    {task.priority}
                                  </span>
                                </div>

                                <p className="text-xs sm:text-sm text-slate-100 group-hover:text-indigo-300 font-semibold leading-snug line-clamp-2 mb-2">
                                  {task.title}
                                </p>

                                {task.tags && task.tags.length > 0 && (
                                  <div className="flex items-center gap-1 flex-wrap mb-2">
                                    {task.tags.slice(0, 3).map((tag, i) => (
                                      <span key={i} className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono">
                                        {tag}
                                      </span>
                                    ))}
                                  </div>
                                )}

                                {totalSubtasks > 0 && (
                                  <div className="mt-2 bg-slate-800/80 rounded px-2 py-1 flex items-center gap-2">
                                    <div className="flex-1 h-1 bg-slate-700 rounded-full overflow-hidden">
                                      <div
                                        className="bg-cyan-500 h-full transition-all duration-300"
                                        style={{ width: `${Math.round((completedSubtasks / totalSubtasks) * 100)}%` }}
                                      />
                                    </div>
                                    <span className="text-[9px] text-slate-400 font-mono">
                                      {completedSubtasks}/{totalSubtasks}
                                    </span>
                                  </div>
                                )}

                                <div className="flex items-center justify-between border-t border-slate-700/60 pt-2 mt-2 text-[11px] text-slate-400">
                                  <div className="flex items-center gap-2">
                                    {task.dueDate && (
                                      <span className="flex items-center gap-1 font-mono text-[10px] text-slate-300">
                                        <Clock className="w-3 h-3 text-amber-400" />
                                        {task.dueDate.split('-').slice(1).join('/')}
                                      </span>
                                    )}

                                    {task.attachments && task.attachments.length > 0 && (
                                      <span className="flex items-center gap-1 text-[10px] font-mono">
                                        <Paperclip className="w-3 h-3 text-slate-400" />
                                        {task.attachments.length}
                                      </span>
                                    )}
                                  </div>

                                  <div className="flex -space-x-1 overflow-hidden">
                                    {task.assignees.map((assigneeId, idx) => {
                                      const u = allUsers.find(user => user.id === assigneeId);
                                      if (!u) return null;
                                      return (
                                        <img
                                          key={idx}
                                          src={u.avatar}
                                          alt={u.name}
                                          title={u.name}
                                          className="inline-block w-5 h-5 rounded-full ring-1 ring-slate-800 object-cover"
                                        />
                                      );
                                    })}
                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        );
                      })}
                      {provided.placeholder}

                      {newTaskColumnId === column.id && (
                        <div className="bg-slate-800 border border-indigo-500/50 rounded-xl p-3 shadow-lg">
                          <input
                            type="text"
                            autoFocus
                            placeholder="Enter task title..."
                            value={quickTitle}
                            onChange={(e) => setQuickTitle(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleQuickAdd(column.id);
                              if (e.key === 'Escape') setNewTaskColumnId(null);
                            }}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 mb-2"
                          />
                          <div className="flex items-center justify-between">
                            <button
                              onClick={() => handleQuickAdd(column.id)}
                              className="px-3 py-1 bg-indigo-600 text-xs font-bold text-white rounded-lg hover:bg-indigo-500"
                            >
                              Add Card
                            </button>
                            <button
                              onClick={() => setNewTaskColumnId(null)}
                              className="px-2 py-1 text-xs text-slate-400 hover:text-white"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </Droppable>

                <div className="p-2.5 border-t border-slate-800/80">
                  <button
                    onClick={() => setNewTaskColumnId(column.id)}
                    className="w-full py-2 px-3 text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 rounded-xl flex items-center justify-center gap-1.5 transition border border-dashed border-slate-800 hover:border-slate-700"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Task</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
};
