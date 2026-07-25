import { Router, Response } from 'express';
import { db } from '../db.js';
import { AuthRequest } from '../auth.js';
import { aiService } from '../ai.js';

export const aiRouter = Router();

// Decompose High Level Task into Subtasks
aiRouter.post('/decompose-task', async (req: AuthRequest, res: Response) => {
  const { title, description } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'Task title is required' });
  }

  try {
    const result = await aiService.decomposeTask(title, description);
    res.json({ result });
  } catch (err: any) {
    res.status(500).json({ error: 'AI Decomposition failed', details: err.message });
  }
});

// Summarize Comment Thread
aiRouter.post('/summarize-comments', async (req: AuthRequest, res: Response) => {
  const { taskId, taskTitle } = req.body;
  const comments = db.comments.filter(c => c.taskId === taskId);

  try {
    const summary = await aiService.summarizeComments(taskTitle || 'Task', comments);
    res.json({ summary });
  } catch (err: any) {
    res.status(500).json({ error: 'AI Summarize failed', details: err.message });
  }
});
