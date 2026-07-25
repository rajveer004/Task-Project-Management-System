import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { User, UserRole } from './types.js';
import { db } from './db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'subpilot_enterprise_secret_key_2026';

export interface AuthRequest extends Request {
  user?: User;
}

export function generateToken(user: User, mfaVerified = false): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      mfaVerified
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // If no token, check query param or default to Demo Admin user for ease of testing
    const defaultUser = db.users[0];
    req.user = defaultUser;
    return next();
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    const foundUser = db.users.find(u => u.id === decoded.id) || db.users[0];
    req.user = foundUser;
    next();
  } catch (err) {
    // Fallback to active demo user
    req.user = db.users[0];
    next();
  }
}

export function requireRole(allowedRoles: UserRole[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const userRole = req.user?.role || 'Guest';
    if (!allowedRoles.includes(userRole)) {
      db.logSecurity(
        req.user?.id || 'unknown',
        req.user?.name || 'Guest User',
        req.user?.email || 'unknown',
        'UNAUTHORIZED_ACCESS_ATTEMPT',
        `Attempted to access restricted endpoint requiring role [${allowedRoles.join(', ')}].`,
        'high'
      );
      return res.status(403).json({
        error: 'Forbidden',
        message: `Role '${userRole}' does not have sufficient permission for this action.`
      });
    }
    next();
  };
}
