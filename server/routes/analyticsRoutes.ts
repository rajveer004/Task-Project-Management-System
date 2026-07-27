import { Router, Response } from 'express';
import { db } from '../db.js';
import { AuthRequest } from '../auth.js';
import { CapacityMetric } from '../types.js';

export const analyticsRouter = Router();

// Workload & Capacity Threshold Analytics
analyticsRouter.get('/capacity', (req: AuthRequest, res: Response) => {
  const { boardId } = req.query;
  let relevantTasks = db.tasks;
  if (boardId) {
    relevantTasks = relevantTasks.filter(t => t.boardId === boardId);
  }

  const todayStr = new Date().toISOString().split('T')[0];

  const metrics: CapacityMetric[] = db.users.map(user => {
    const assignedTasks = relevantTasks.filter(t => t.assignees.includes(user.id));
    const activeTasks = assignedTasks.filter(t => t.listId !== 'done');
    const completedTasks = assignedTasks.filter(t => t.listId === 'done');
    const overdueTasks = activeTasks.filter(t => t.dueDate && t.dueDate < todayStr);

    const totalEstimatedHours = activeTasks.reduce((acc, t) => acc + (t.estimatedHours || 8), 0);
    const limit = user.capacityLimit || 4;
    const capacityUtilizationPercentage = Math.round((activeTasks.length / limit) * 100);
    const isOverloaded = activeTasks.length > limit;

    return {
      user,
      activeTasks: activeTasks.length,
      completedTasks: completedTasks.length,
      overdueTasks: overdueTasks.length,
      totalEstimatedHours,
      capacityLimit: limit,
      capacityUtilizationPercentage,
      isOverloaded
    };
  });

  res.json({ metrics });
});

// Velocity & Completion Trends
analyticsRouter.get('/velocity', (req: AuthRequest, res: Response) => {
  const { boardId } = req.query;
  let tasks = db.tasks;
  if (boardId) tasks = tasks.filter(t => t.boardId === boardId);

  const statusDistribution = [
    { name: 'Backlog', count: tasks.filter(t => t.listId === 'backlog').length, color: '#64748B' },
    { name: 'To Do', count: tasks.filter(t => t.listId === 'todo').length, color: '#3B82F6' },
    { name: 'In Progress', count: tasks.filter(t => t.listId === 'in_progress').length, color: '#EAB308' },
    { name: 'In Review', count: tasks.filter(t => t.listId === 'review').length, color: '#A855F7' },
    { name: 'Done', count: tasks.filter(t => t.listId === 'done').length, color: '#22C55E' }
  ];

  const priorityDistribution = [
    { name: 'Urgent', count: tasks.filter(t => t.priority === 'Urgent').length },
    { name: 'High', count: tasks.filter(t => t.priority === 'High').length },
    { name: 'Medium', count: tasks.filter(t => t.priority === 'Medium').length },
    { name: 'Low', count: tasks.filter(t => t.priority === 'Low').length }
  ];

  res.json({
    totalTasks: tasks.length,
    completedTasks: tasks.filter(t => t.listId === 'done').length,
    inProgressTasks: tasks.filter(t => t.listId === 'in_progress').length,
    statusDistribution,
    priorityDistribution
  });
});
