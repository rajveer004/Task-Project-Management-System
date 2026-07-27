import { Router, Response } from 'express';
import { db } from '../db.js';
import { generateToken, AuthRequest } from '../auth.js';

export const authRouter = Router();

// Login / Switch User with Credentials or Direct ID
authRouter.post('/login', (req: AuthRequest, res: Response) => {
  const { email, userId, emailOrId, password } = req.body;

  const queryIdentifier = (emailOrId || email || userId || '').trim().toLowerCase();

  let targetUser = db.users.find(u =>
    u.id.toLowerCase() === queryIdentifier ||
    u.email.toLowerCase() === queryIdentifier
  );

  // Fallback for direct userId call if queryIdentifier was just userId
  if (!targetUser && userId) {
    targetUser = db.users.find(u => u.id === userId);
  }

  if (!targetUser) {
    return res.status(401).json({ error: 'User account not found. Please check your Email/User ID or register a new account.' });
  }

  // Validate password if provided
  if (password !== undefined && password !== null && password !== '') {
    const expectedPassword = targetUser.password || 'password123';
    if (password !== expectedPassword) {
      return res.status(401).json({ error: 'Invalid password. (Default demo user password is "password123")' });
    }
  }

  const token = generateToken(targetUser, true);

  db.logSecurity(
    targetUser.id,
    targetUser.name,
    targetUser.email,
    'USER_LOGIN',
    `User ${targetUser.name} authenticated successfully with role ${targetUser.role}.`
  );

  res.json({
    user: targetUser,
    token
  });
});

// Register New User
authRouter.post('/register', (req: AuthRequest, res: Response) => {
  const { name, email, password, role, department } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required.' });
  }

  const existing = db.users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
  if (existing) {
    return res.status(400).json({ error: 'Account with this email already exists. Please sign in.' });
  }

  const newUser = {
    id: `user_${Date.now()}`,
    name: name.trim(),
    email: email.trim(),
    password: password || 'password123',
    avatar: `https://images.unsplash.com/photo-${1534528741775 + Math.floor(Math.random() * 1000)}?w=150&auto=format&fit=crop&q=80`,
    role: role || 'Member',
    department: department || 'Engineering',
    capacityLimit: 4,
    mfaEnabled: false,
    status: 'active' as const
  };

  db.users.push(newUser);
  const token = generateToken(newUser, true);

  db.logSecurity(
    newUser.id,
    newUser.name,
    newUser.email,
    'USER_REGISTERED',
    `New account registered: ${newUser.name} (${newUser.email}).`,
    'medium'
  );

  res.status(201).json({ user: newUser, token });
});

// Get Current Profile
authRouter.get('/me', (req: AuthRequest, res: Response) => {
  res.json({ user: req.user });
});

// Toggle MFA for user
authRouter.post('/mfa/toggle', (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  const user = db.users.find(u => u.id === req.user!.id);
  if (user) {
    user.mfaEnabled = !user.mfaEnabled;
    db.logSecurity(
      user.id,
      user.name,
      user.email,
      'MFA_STATUS_UPDATED',
      `Multi-Factor Authentication was ${user.mfaEnabled ? 'ENABLED' : 'DISABLED'}.`,
      'medium'
    );
  }

  res.json({ user, message: `MFA updated to ${user?.mfaEnabled}` });
});

// Get All Users (for mention popovers & assignees)
authRouter.get('/users', (req: AuthRequest, res: Response) => {
  res.json({ users: db.users });
});
