import { Router, Response } from 'express';
import { db } from '../db.js';
import { AuthRequest, requireRole } from '../auth.js';
import { AutomationRule } from '../types.js';

export const automationRouter = Router();

automationRouter.get('/', (req: AuthRequest, res: Response) => {
  const { boardId } = req.query;
  let rules = db.automations;
  if (boardId) rules = rules.filter(r => r.boardId === boardId);
  res.json({ automations: rules });
});

automationRouter.post('/', requireRole(['Admin', 'Member']), (req: AuthRequest, res: Response) => {
  const { boardId, name, triggerEvent, triggerValue, actionType, actionValue } = req.body;
  if (!boardId || !name || !triggerEvent || !actionType) {
    return res.status(400).json({ error: 'Missing required automation parameters' });
  }

  const newRule: AutomationRule = {
    id: `rule_${Date.now()}`,
    boardId,
    name,
    triggerEvent,
    triggerValue: triggerValue || '',
    actionType,
    actionValue: actionValue || '',
    enabled: true,
    createdAt: new Date().toISOString(),
    runCount: 0
  };

  db.automations.push(newRule);
  db.broadcast('automation_created', newRule);

  db.logSecurity(
    req.user!.id,
    req.user!.name,
    req.user!.email,
    'AUTOMATION_RULE_CREATED',
    `Created automation rule "${newRule.name}".`
  );

  res.status(201).json({ automation: newRule });
});

// Toggle Automation Rule Status
automationRouter.put('/:id/toggle', requireRole(['Admin', 'Member']), (req: AuthRequest, res: Response) => {
  const rule = db.automations.find(r => r.id === req.params.id);
  if (!rule) return res.status(404).json({ error: 'Rule not found' });

  rule.enabled = !rule.enabled;
  db.broadcast('automation_updated', rule);

  db.logSecurity(
    req.user!.id,
    req.user!.name,
    req.user!.email,
    'AUTOMATION_RULE_TOGGLED',
    `Toggled automation rule "${rule.name}" to ${rule.enabled ? 'ENABLED' : 'DISABLED'}.`
  );

  res.json({ automation: rule });
});

// Test / Execute Automation Rule Manually
automationRouter.post('/:id/test', requireRole(['Admin', 'Member']), (req: AuthRequest, res: Response) => {
  const rule = db.automations.find(r => r.id === req.params.id);
  if (!rule) return res.status(404).json({ error: 'Rule not found' });

  const boardTasks = db.tasks.filter(t => t.boardId === rule.boardId);
  let affectedCount = 0;

  boardTasks.forEach(task => {
    let matches = false;

    if (rule.triggerEvent === 'status_changed') {
      if (!rule.triggerValue || rule.triggerValue === 'all' || task.listId.toLowerCase() === rule.triggerValue.toLowerCase()) {
        matches = true;
      }
    } else if (rule.triggerEvent === 'priority_changed') {
      if (!rule.triggerValue || rule.triggerValue === 'all' || task.priority.toLowerCase() === rule.triggerValue.toLowerCase()) {
        matches = true;
      }
    } else if (rule.triggerEvent === 'task_created') {
      matches = true;
    } else if (rule.triggerEvent === 'tag_added') {
      if (rule.triggerValue && task.tags.some(t => t.toLowerCase() === rule.triggerValue.toLowerCase())) {
        matches = true;
      }
    }

    if (matches) {
      let taskModified = false;

      if (rule.actionType === 'auto_assign') {
        if (!task.assignees.includes(rule.actionValue)) {
          task.assignees.push(rule.actionValue);
          taskModified = true;
        }
      } else if (rule.actionType === 'move_list') {
        if (task.listId !== rule.actionValue) {
          task.listId = rule.actionValue;
          taskModified = true;
        }
      } else if (rule.actionType === 'set_priority') {
        if (task.priority !== rule.actionValue) {
          task.priority = rule.actionValue as any;
          taskModified = true;
        }
      } else if (rule.actionType === 'add_tag') {
        if (!task.tags.some(t => t.toLowerCase() === rule.actionValue.toLowerCase())) {
          task.tags.push(rule.actionValue);
          taskModified = true;
        }
      } else if (rule.actionType === 'send_notification') {
        const notif = {
          id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
          userId: rule.actionValue,
          title: `Manual Rule Execution: ${rule.name}`,
          message: `Rule "${rule.name}" executed on task "${task.title}".`,
          type: 'automation' as const,
          read: false,
          createdAt: new Date().toISOString(),
          linkTaskId: task.id
        };
        db.notifications.unshift(notif);
        db.broadcast('notification_created', notif);
        affectedCount++;
      }

      if (taskModified) {
        task.updatedAt = new Date().toISOString();
        db.broadcast('task_updated', task);
        affectedCount++;
      }
    }
  });

  rule.runCount = (rule.runCount || 0) + 1;
  rule.lastTriggeredAt = new Date().toISOString();

  db.broadcast('automation_updated', rule);

  db.logSecurity(
    req.user!.id,
    req.user!.name,
    req.user!.email,
    'AUTOMATION_RULE_MANUAL_TEST',
    `Manually tested rule "${rule.name}". Affected ${affectedCount} task(s).`
  );

  res.json({ message: 'Automation test completed', affectedCount, rule });
});

// Delete Automation Rule
automationRouter.delete('/:id', requireRole(['Admin', 'Member']), (req: AuthRequest, res: Response) => {
  const idx = db.automations.findIndex(r => r.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Rule not found' });

  const deleted = db.automations.splice(idx, 1)[0];
  db.broadcast('automation_deleted', { id: req.params.id });

  db.logSecurity(
    req.user!.id,
    req.user!.name,
    req.user!.email,
    'AUTOMATION_RULE_DELETED',
    `Deleted automation rule "${deleted.name}".`
  );

  res.json({ message: 'Automation deleted', deleted });
});
