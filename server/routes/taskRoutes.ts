import { Router, Response } from 'express';
import { db } from '../db.js';
import { AuthRequest, requireRole } from '../auth.js';
import { Task, Comment, ActivityLog } from '../types.js';

export const taskRouter = Router();

// Get Tasks by Board ID
taskRouter.get('/', (req: AuthRequest, res: Response) => {
  const { boardId } = req.query;
  let filtered = db.tasks;
  if (boardId) {
    filtered = filtered.filter(t => t.boardId === boardId);
  }
  res.json({ tasks: filtered });
});

// Create New Task
taskRouter.post('/', requireRole(['Admin', 'Member']), (req: AuthRequest, res: Response) => {
  const {
    boardId,
    listId,
    title,
    description,
    priority,
    tags,
    assignees,
    dueDate,
    startDate,
    estimatedHours,
    subtasks,
    coverImage
  } = req.body;

  if (!title || !boardId || !listId) {
    return res.status(400).json({ error: 'Title, boardId, and listId are required' });
  }

  const newTask: Task = {
    id: `task_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    boardId,
    listId,
    title,
    description: description || '',
    priority: priority || 'Medium',
    tags: Array.isArray(tags) ? tags : [],
    assignees: Array.isArray(assignees) ? assignees : [],
    dueDate: dueDate || undefined,
    startDate: startDate || undefined,
    estimatedHours: estimatedHours || 8,
    actualHours: 0,
    subtasks: Array.isArray(subtasks) ? subtasks : [],
    attachments: [],
    coverImage: coverImage || undefined,
    position: db.tasks.filter(t => t.boardId === boardId && t.listId === listId).length,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.tasks.push(newTask);

  // Activity log
  const act: ActivityLog = {
    id: `act_${Date.now()}`,
    taskId: newTask.id,
    boardId,
    userId: req.user!.id,
    userName: req.user!.name,
    userAvatar: req.user!.avatar,
    action: `created task "${newTask.title}"`,
    timestamp: new Date().toISOString(),
    type: 'task'
  };
  db.activities.unshift(act);

  db.broadcast('task_created', newTask);
  db.broadcast('activity_created', act);

  // Execute Rule Trigger Engine
  evaluateAutomations('task_created', newTask, req.user!);

  res.status(201).json({ task: newTask });
});

// Move Task (Drag and drop status or position reorder)
taskRouter.put('/:id/move', requireRole(['Admin', 'Member', 'Guest']), (req: AuthRequest, res: Response) => {
  const task = db.tasks.find(t => t.id === req.params.id);
  if (!task) return res.status(404).json({ error: 'Task not found' });

  const { targetListId, targetPosition } = req.body;
  const oldListId = task.listId;

  if (targetListId) task.listId = targetListId;
  if (typeof targetPosition === 'number') task.position = targetPosition;
  task.updatedAt = new Date().toISOString();

  // Activity log if column changed
  if (oldListId !== targetListId) {
    const act: ActivityLog = {
      id: `act_${Date.now()}`,
      taskId: task.id,
      boardId: task.boardId,
      userId: req.user!.id,
      userName: req.user!.name,
      userAvatar: req.user!.avatar,
      action: `moved "${task.title}" from ${oldListId} to ${targetListId}`,
      timestamp: new Date().toISOString(),
      type: 'task'
    };
    db.activities.unshift(act);
    db.broadcast('activity_created', act);

    // Rule trigger
    evaluateAutomations('status_changed', task, req.user!);
  }

  db.broadcast('task_updated', task);
  res.json({ task });
});

// Update Task Details
taskRouter.put('/:id', requireRole(['Admin', 'Member']), (req: AuthRequest, res: Response) => {
  const task = db.tasks.find(t => t.id === req.params.id);
  if (!task) return res.status(404).json({ error: 'Task not found' });

  const oldPriority = task.priority;
  const fields = ['title', 'description', 'priority', 'tags', 'assignees', 'dueDate', 'startDate', 'estimatedHours', 'actualHours', 'subtasks', 'coverImage', 'attachments'];

  fields.forEach(f => {
    if (req.body[f] !== undefined) {
      (task as any)[f] = req.body[f];
    }
  });
  task.updatedAt = new Date().toISOString();

  // Priority automation trigger
  if (oldPriority !== task.priority) {
    evaluateAutomations('priority_changed', task, req.user!);
  }

  db.broadcast('task_updated', task);
  res.json({ task });
});

// Delete Task
taskRouter.delete('/:id', requireRole(['Admin', 'Member']), (req: AuthRequest, res: Response) => {
  const idx = db.tasks.findIndex(t => t.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Task not found' });

  const deleted = db.tasks.splice(idx, 1)[0];
  db.broadcast('task_deleted', { id: req.params.id });

  db.logSecurity(
    req.user!.id,
    req.user!.name,
    req.user!.email,
    'TASK_DELETED',
    `Task "${deleted.title}" was deleted.`
  );

  res.json({ message: 'Task deleted successfully' });
});

// Get Comments for a Task
taskRouter.get('/:id/comments', (req: AuthRequest, res: Response) => {
  const comments = db.comments.filter(c => c.taskId === req.params.id);
  res.json({ comments });
});

// Add Comment with @mentions detection
taskRouter.post('/:id/comments', requireRole(['Admin', 'Member', 'Guest']), (req: AuthRequest, res: Response) => {
  const { content, mentions } = req.body;
  if (!content) return res.status(400).json({ error: 'Comment content required' });

  const newComment: Comment = {
    id: `comm_${Date.now()}`,
    taskId: req.params.id,
    userId: req.user!.id,
    userName: req.user!.name,
    userAvatar: req.user!.avatar,
    content,
    createdAt: new Date().toISOString(),
    mentions: Array.isArray(mentions) ? mentions : []
  };

  db.comments.push(newComment);
  db.broadcast('comment_created', newComment);

  // Send Notifications if mentioned
  if (newComment.mentions && newComment.mentions.length > 0) {
    newComment.mentions.forEach(mentionedName => {
      const target = db.users.find(u => u.name.toLowerCase() === mentionedName.toLowerCase());
      if (target) {
        const notif = {
          id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
          userId: target.id,
          title: 'You were mentioned',
          message: `${req.user!.name} mentioned you in a comment.`,
          type: 'mention' as const,
          read: false,
          createdAt: new Date().toISOString(),
          linkTaskId: req.params.id
        };
        db.notifications.unshift(notif);
        db.broadcast('notification_created', notif);
      }
    });
  }

  res.status(201).json({ comment: newComment });
});

// Get Task Activity Logs
taskRouter.get('/:id/activities', (req: AuthRequest, res: Response) => {
  const activities = db.activities.filter(a => a.taskId === req.params.id);
  res.json({ activities });
});

// Helper Function for Automations Rule Engine
function evaluateAutomations(triggerType: string, task: Task, actor: any) {
  const rules = db.automations.filter(r => r.boardId === task.boardId && r.enabled);

  rules.forEach(rule => {
    if (rule.triggerEvent === triggerType) {
      // Check status or value matching
      if (triggerType === 'status_changed' && rule.triggerValue && rule.triggerValue !== 'all') {
        if (task.listId.toLowerCase() !== rule.triggerValue.toLowerCase()) return;
      }
      if (triggerType === 'priority_changed' && rule.triggerValue && rule.triggerValue !== 'all') {
        if (task.priority.toLowerCase() !== rule.triggerValue.toLowerCase()) return;
      }
      if (triggerType === 'tag_added' && rule.triggerValue && rule.triggerValue !== 'all') {
        if (!task.tags.some(t => t.toLowerCase() === rule.triggerValue.toLowerCase())) return;
      }

      let taskUpdated = false;

      // Execute Action
      if (rule.actionType === 'auto_assign') {
        if (!task.assignees.includes(rule.actionValue)) {
          task.assignees.push(rule.actionValue);
          taskUpdated = true;
        }
      } else if (rule.actionType === 'move_list') {
        if (task.listId !== rule.actionValue) {
          task.listId = rule.actionValue;
          taskUpdated = true;
        }
      } else if (rule.actionType === 'set_priority') {
        if (task.priority !== rule.actionValue) {
          task.priority = rule.actionValue as any;
          taskUpdated = true;
        }
      } else if (rule.actionType === 'add_tag') {
        if (!task.tags.some(t => t.toLowerCase() === rule.actionValue.toLowerCase())) {
          task.tags.push(rule.actionValue);
          taskUpdated = true;
        }
      } else if (rule.actionType === 'send_notification') {
        const notif = {
          id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
          userId: rule.actionValue,
          title: `Automation Triggered: ${rule.name}`,
          message: `Task "${task.title}" triggered rule [${rule.name}].`,
          type: 'automation' as const,
          read: false,
          createdAt: new Date().toISOString(),
          linkTaskId: task.id
        };
        db.notifications.unshift(notif);
        db.broadcast('notification_created', notif);
      }

      rule.runCount = (rule.runCount || 0) + 1;
      rule.lastTriggeredAt = new Date().toISOString();
      db.broadcast('automation_updated', rule);

      if (taskUpdated) {
        task.updatedAt = new Date().toISOString();
        db.broadcast('task_updated', task);
      }

      db.logSecurity(
        actor?.id || 'system',
        actor?.name || 'Automation Engine',
        actor?.email || 'system@subpilot.io',
        'AUTOMATION_RULE_EXECUTED',
        `Rule "${rule.name}" triggered on task "${task.title}".`
      );
    }
  });
}
