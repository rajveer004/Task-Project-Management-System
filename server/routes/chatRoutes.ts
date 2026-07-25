import { Router, Response } from 'express';
import { db } from '../db.js';
import { AuthRequest } from '../auth.js';
import { TeamChatMessage } from '../types.js';

export const chatRouter = Router();

// GET chat messages for a workspace board
chatRouter.get('/:boardId', (req: AuthRequest, res: Response) => {
  const { boardId } = req.params;
  const messages = (db.chatMessages || []).filter(m => m.boardId === boardId);
  res.json({ messages });
});

// POST send message to a workspace board team channel
chatRouter.post('/:boardId', (req: AuthRequest, res: Response) => {
  const { boardId } = req.params;
  const { message } = req.body;

  if (!message || !message.trim()) {
    return res.status(400).json({ error: 'Message text is required' });
  }

  const board = db.boards.find(b => b.id === boardId);
  if (!board) {
    return res.status(404).json({ error: 'Workspace board not found' });
  }

  const chatMsg: TeamChatMessage = {
    id: `chat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    boardId,
    senderId: req.user!.id,
    senderName: req.user!.name,
    senderAvatar: req.user!.avatar,
    message: message.trim(),
    timestamp: new Date().toISOString()
  };

  db.chatMessages.push(chatMsg);
  db.broadcast('chat_message_created', chatMsg);

  res.status(201).json({ message: chatMsg });
});
