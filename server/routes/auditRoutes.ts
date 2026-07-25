import { Router, Response } from 'express';
import { db } from '../db.js';
import { AuthRequest, requireRole } from '../auth.js';

export const auditRouter = Router();

// Get Security Audit Logs (Admin & Member & Guest)
auditRouter.get('/', requireRole(['Admin', 'Member', 'Guest']), (req: AuthRequest, res: Response) => {
  const { severity, search, limit } = req.query;
  let logs = db.securityLogs;

  if (severity && severity !== 'all') {
    logs = logs.filter(l => l.severity.toLowerCase() === String(severity).toLowerCase());
  }

  if (search) {
    const q = String(search).toLowerCase();
    logs = logs.filter(l =>
      l.userName.toLowerCase().includes(q) ||
      (l.userEmail && l.userEmail.toLowerCase().includes(q)) ||
      l.action.toLowerCase().includes(q) ||
      (l.details && l.details.toLowerCase().includes(q))
    );
  }

  if (limit) {
    const max = parseInt(String(limit), 10);
    if (!isNaN(max) && max > 0) {
      logs = logs.slice(0, max);
    }
  }

  res.json({ logs });
});

// Post Custom Security Event / Audit Entry
auditRouter.post('/log', requireRole(['Admin', 'Member']), (req: AuthRequest, res: Response) => {
  const { action, details, severity } = req.body;
  if (!action) {
    return res.status(400).json({ error: 'Action title is required' });
  }

  const validSeverity = ['low', 'medium', 'high', 'critical'].includes(severity)
    ? severity
    : 'low';

  const entry = db.logSecurity(
    req.user!.id,
    req.user!.name,
    req.user!.email,
    action.toUpperCase().replace(/\s+/g, '_'),
    details || 'Manual security event recorded by user.',
    validSeverity
  );

  res.status(201).json({ log: entry });
});

// Clear / Purge Security Logs (Admin only)
auditRouter.delete('/clear', requireRole(['Admin']), (req: AuthRequest, res: Response) => {
  const previousCount = db.securityLogs.length;
  db.securityLogs = [];

  // Always log the purge action itself as a new security log
  const purgeEntry = db.logSecurity(
    req.user!.id,
    req.user!.name,
    req.user!.email,
    'SECURITY_AUDIT_LOG_PURGED',
    `Admin purged ${previousCount} security audit entries.`,
    'high'
  );

  res.json({ message: 'Security logs purged successfully', remaining: [purgeEntry] });
});

// Export CSV Audit Report
auditRouter.get('/export/csv', requireRole(['Admin']), (req: AuthRequest, res: Response) => {
  const logs = db.securityLogs;
  let csv = 'ID,Timestamp,User Name,User Email,Action,Severity,IP Address,Details\n';

  logs.forEach(log => {
    const cleanDetails = `"${(log.details || '').replace(/"/g, '""')}"`;
    csv += `${log.id},${log.timestamp},"${log.userName}",${log.userEmail},${log.action},${log.severity},${log.ipAddress},${cleanDetails}\n`;
  });

  db.logSecurity(
    req.user!.id,
    req.user!.name,
    req.user!.email,
    'SECURITY_AUDIT_REPORT_EXPORTED_CSV',
    'Admin downloaded CSV compliance report.',
    'medium'
  );

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="SubPilot_Security_Audit_${Date.now()}.csv"`);
  res.send(csv);
});

// Export JSON Audit Report
auditRouter.get('/export/json', requireRole(['Admin']), (req: AuthRequest, res: Response) => {
  db.logSecurity(
    req.user!.id,
    req.user!.name,
    req.user!.email,
    'SECURITY_AUDIT_REPORT_EXPORTED_JSON',
    'Admin downloaded JSON compliance report.',
    'medium'
  );

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="SubPilot_Security_Audit_${Date.now()}.json"`);
  res.send(JSON.stringify(db.securityLogs, null, 2));
});
