import { Router, Response } from 'express';
import { db } from '../db.js';
import { AuthRequest, requireRole } from '../auth.js';
import { Board } from '../types.js';

export const boardRouter = Router();

// Get All Boards
boardRouter.get('/', (req: AuthRequest, res: Response) => {
  res.json({ boards: db.boards });
});

// Get Single Board by ID
boardRouter.get('/:id', (req: AuthRequest, res: Response) => {
  const board = db.boards.find(b => b.id === req.params.id);
  if (!board) return res.status(404).json({ error: 'Board not found' });
  res.json({ board });
});

// Create New Board (Admin / Member)
boardRouter.post('/', requireRole(['Admin', 'Member']), (req: AuthRequest, res: Response) => {
  const { name, description, category, isPrivate } = req.body;
  if (!name) return res.status(400).json({ error: 'Board name is required' });

  const newBoard: Board = {
    id: `board_${Date.now()}`,
    name,
    description: description || '',
    category: category || 'General',
    isPrivate: Boolean(isPrivate),
    members: [
      { userId: req.user!.id, role: 'Owner' }
    ],
    columns: [
      { id: 'backlog', boardId: `board_${Date.now()}`, title: 'Backlog', color: '#64748B', position: 0 },
      { id: 'todo', boardId: `board_${Date.now()}`, title: 'To Do', color: '#3B82F6', position: 1 },
      { id: 'in_progress', boardId: `board_${Date.now()}`, title: 'In Progress', color: '#EAB308', position: 2 },
      { id: 'review', boardId: `board_${Date.now()}`, title: 'In Review', color: '#A855F7', position: 3 },
      { id: 'done', boardId: `board_${Date.now()}`, title: 'Done', color: '#22C55E', position: 4 }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.boards.push(newBoard);
  db.broadcast('board_created', newBoard);

  db.logSecurity(
    req.user!.id,
    req.user!.name,
    req.user!.email,
    'BOARD_CREATED',
    `Created project board "${newBoard.name}".`
  );

  res.status(201).json({ board: newBoard });
});

// Update Board Columns or Settings
boardRouter.put('/:id', requireRole(['Admin', 'Member']), (req: AuthRequest, res: Response) => {
  const board = db.boards.find(b => b.id === req.params.id);
  if (!board) return res.status(404).json({ error: 'Board not found' });

  if (req.body.name) board.name = req.body.name;
  if (req.body.description !== undefined) board.description = req.body.description;
  if (req.body.columns) board.columns = req.body.columns;
  board.updatedAt = new Date().toISOString();

  db.broadcast('board_updated', board);
  res.json({ board });
});

// Add New Column to Board
boardRouter.post('/:id/columns', requireRole(['Admin', 'Member']), (req: AuthRequest, res: Response) => {
  const board = db.boards.find(b => b.id === req.params.id);
  if (!board) return res.status(404).json({ error: 'Board not found' });

  const { title, color } = req.body;
  if (!title) return res.status(400).json({ error: 'Column title is required' });

  const newColId = `col_${Date.now()}`;
  board.columns.push({
    id: newColId,
    boardId: board.id,
    title,
    color: color || '#6366f1',
    position: board.columns.length
  });

  board.updatedAt = new Date().toISOString();
  db.broadcast('board_updated', board);
  res.status(201).json({ board });
});

// Delete Board (Admin / Owner / Member)
boardRouter.delete('/:id', requireRole(['Admin', 'Owner', 'Member']), (req: AuthRequest, res: Response) => {
  const idx = db.boards.findIndex(b => b.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Board not found' });

  const deleted = db.boards.splice(idx, 1)[0];
  db.tasks = db.tasks.filter(t => t.boardId !== req.params.id);

  // If no boards remain, create a clean default workspace
  if (db.boards.length === 0) {
    const defaultBoard: Board = {
      id: `board_${Date.now()}`,
      name: 'Main Workspace',
      description: 'Default project board',
      category: 'General',
      isPrivate: false,
      members: [{ userId: req.user!.id, role: 'Owner' }],
      columns: [
        { id: 'backlog', boardId: `board_${Date.now()}`, title: 'Backlog', color: '#64748B', position: 0 },
        { id: 'todo', boardId: `board_${Date.now()}`, title: 'To Do', color: '#3B82F6', position: 1 },
        { id: 'in_progress', boardId: `board_${Date.now()}`, title: 'In Progress', color: '#EAB308', position: 2 },
        { id: 'review', boardId: `board_${Date.now()}`, title: 'In Review', color: '#A855F7', position: 3 },
        { id: 'done', boardId: `board_${Date.now()}`, title: 'Done', color: '#22C55E', position: 4 }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    db.boards.push(defaultBoard);
    db.broadcast('board_created', defaultBoard);
  }

  db.broadcast('board_deleted', { id: req.params.id });

  db.logSecurity(
    req.user!.id,
    req.user!.name,
    req.user!.email,
    'BOARD_DELETED',
    `Permanently deleted board "${deleted.name}".`,
    'high'
  );

  res.json({ message: 'Board deleted successfully' });
});
