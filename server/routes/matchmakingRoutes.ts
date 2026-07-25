import { Router, Response } from 'express';
import { db } from '../db.js';
import { AuthRequest } from '../auth.js';
import { ProjectPosting, ProjectApplication, Board, Notification } from '../types.js';

export const matchmakingRouter = Router();

// GET all project postings
matchmakingRouter.get('/postings', (req: AuthRequest, res: Response) => {
  res.json({ postings: db.projectPostings || [] });
});

// CREATE project posting
matchmakingRouter.post('/postings', (req: AuthRequest, res: Response) => {
  const { title, description, rolesNeeded, requiredSkills, targetTeamSize, createWorkspace } = req.body;

  if (!title || !description) {
    return res.status(400).json({ error: 'Title and description are required' });
  }

  let boardId: string | undefined = undefined;

  // Auto-create workspace board if requested
  if (createWorkspace) {
    const newBoard: Board = {
      id: `board_proj_${Date.now()}`,
      name: title,
      description: description,
      category: 'Matchmaking Project',
      isPrivate: false,
      members: [
        { userId: req.user!.id, role: 'Owner' }
      ],
      columns: [
        { id: 'backlog', boardId: `board_proj_${Date.now()}`, title: 'Backlog', color: '#64748B', position: 0 },
        { id: 'todo', boardId: `board_proj_${Date.now()}`, title: 'To Do', color: '#3B82F6', position: 1 },
        { id: 'in_progress', boardId: `board_proj_${Date.now()}`, title: 'In Progress', color: '#EAB308', position: 2 },
        { id: 'review', boardId: `board_proj_${Date.now()}`, title: 'In Review', color: '#A855F7', position: 3 },
        { id: 'done', boardId: `board_proj_${Date.now()}`, title: 'Done', color: '#22C55E', position: 4 }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    db.boards.push(newBoard);
    boardId = newBoard.id;
    db.broadcast('board_created', newBoard);
  }

  const posting: ProjectPosting = {
    id: `post_${Date.now()}`,
    title,
    description,
    ownerId: req.user!.id,
    ownerName: req.user!.name,
    ownerAvatar: req.user!.avatar,
    rolesNeeded: Array.isArray(rolesNeeded) ? rolesNeeded : ['Collaborator'],
    requiredSkills: Array.isArray(requiredSkills) ? requiredSkills : [],
    targetTeamSize: Number(targetTeamSize) || 4,
    currentMemberCount: 1,
    status: 'Recruiting',
    boardId,
    createdAt: new Date().toISOString()
  };

  db.projectPostings.unshift(posting);
  db.broadcast('posting_created', posting);

  db.logSecurity(
    req.user!.id,
    req.user!.name,
    req.user!.email,
    'PROJECT_POSTING_CREATED',
    `Created project recruitment posting "${posting.title}".`
  );

  res.status(201).json({ posting });
});

// GET applications for user (either as owner of posting or as applicant)
matchmakingRouter.get('/applications', (req: AuthRequest, res: Response) => {
  const userPostings = db.projectPostings.filter(p => p.ownerId === req.user!.id).map(p => p.id);
  const userApps = db.applications.filter(
    a => a.applicantId === req.user!.id || userPostings.includes(a.projectId)
  );
  res.json({ applications: userApps });
});

// APPLY / Request to Join a Project Posting
matchmakingRouter.post('/applications', (req: AuthRequest, res: Response) => {
  const { projectId, pitchMessage, roleRequested } = req.body;

  const posting = db.projectPostings.find(p => p.id === projectId);
  if (!posting) {
    return res.status(404).json({ error: 'Project posting not found' });
  }

  if (posting.ownerId === req.user!.id) {
    return res.status(400).json({ error: 'You cannot apply to your own project posting' });
  }

  // Check if already applied
  const existing = db.applications.find(a => a.projectId === projectId && a.applicantId === req.user!.id);
  if (existing) {
    return res.status(400).json({ error: 'You have already submitted an application to this project' });
  }

  const application: ProjectApplication = {
    id: `app_${Date.now()}`,
    projectId,
    projectTitle: posting.title,
    applicantId: req.user!.id,
    applicantName: req.user!.name,
    applicantAvatar: req.user!.avatar,
    applicantSkills: req.user!.skills || ['Full Stack'],
    pitchMessage: pitchMessage || 'Excited to collaborate on this project!',
    roleRequested: roleRequested || posting.rolesNeeded[0] || 'Collaborator',
    status: 'Pending',
    createdAt: new Date().toISOString()
  };

  db.applications.unshift(application);

  // Send notification to project owner
  const notif: Notification = {
    id: `notif_app_${Date.now()}`,
    userId: posting.ownerId,
    title: 'New Collaborator Application',
    message: `${req.user!.name} applied for "${application.roleRequested}" on "${posting.title}".`,
    type: 'application',
    read: false,
    createdAt: new Date().toISOString(),
    linkProjectId: posting.id
  };
  db.notifications.unshift(notif);

  db.broadcast('application_created', application);
  db.broadcast('notification_created', notif);

  res.status(201).json({ application });
});

// ACCEPT / REJECT application
matchmakingRouter.put('/applications/:id/status', (req: AuthRequest, res: Response) => {
  const { status } = req.body; // 'Accepted' | 'Rejected'
  if (!['Accepted', 'Rejected'].includes(status)) {
    return res.status(400).json({ error: 'Status must be Accepted or Rejected' });
  }

  const app = db.applications.find(a => a.id === req.params.id);
  if (!app) return res.status(404).json({ error: 'Application not found' });

  const posting = db.projectPostings.find(p => p.id === app.projectId);
  if (!posting) return res.status(404).json({ error: 'Project posting not found' });

  const isOwner = posting.ownerId === req.user!.id;
  const isAuthorizedRole = ['Admin', 'Owner', 'Member'].includes(req.user!.role);
  if (!isOwner && !isAuthorizedRole) {
    return res.status(403).json({ error: 'Only project owners or team members can approve or decline candidates' });
  }

  app.status = status;

  if (status === 'Accepted') {
    // Increment member count
    posting.currentMemberCount = (posting.currentMemberCount || 0) + 1;
    if (posting.currentMemberCount >= posting.targetTeamSize) {
      posting.status = 'In Progress';
    }

    // Auto-add candidate as member to workspace board if boardId exists or fallback to main board
    const targetBoardId = posting.boardId || (db.boards.length > 0 ? db.boards[0].id : null);
    if (targetBoardId) {
      const board = db.boards.find(b => b.id === targetBoardId);
      if (board) {
        const isMember = board.members.some(m => (typeof m === 'string' ? m === app.applicantId : m.userId === app.applicantId));
        if (!isMember && app.applicantId) {
          board.members.push({ userId: app.applicantId, role: 'Member' });
          board.updatedAt = new Date().toISOString();
          db.broadcast('board_updated', board);
        }
      }
    }
  }

  // Notify applicant
  const notif: Notification = {
    id: `notif_app_res_${Date.now()}`,
    userId: app.applicantId,
    title: status === 'Accepted' ? 'Application Accepted! 🎉' : 'Application Update',
    message: status === 'Accepted'
      ? `Congratulations! You were accepted into "${posting.title}" as ${app.roleRequested}.`
      : `Your application for "${posting.title}" was not selected at this time.`,
    type: 'application',
    read: false,
    createdAt: new Date().toISOString()
  };
  db.notifications.unshift(notif);

  db.broadcast('application_status_updated', app);
  db.broadcast('posting_updated', posting);
  db.broadcast('notification_created', notif);

  db.logSecurity(
    req.user!.id,
    req.user!.name,
    req.user!.email,
    'APPLICATION_DECISION',
    `${status} application for user ID ${app.applicantId} on project "${posting.title}".`
  );

  res.json({ application: app, posting });
});

// UPDATE User Collaborator Profile
matchmakingRouter.put('/profile', (req: AuthRequest, res: Response) => {
  const { bio, skills, portfolioUrl, githubUrl, availability } = req.body;

  const user = db.users.find(u => u.id === req.user!.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  if (bio !== undefined) user.bio = bio;
  if (Array.isArray(skills)) user.skills = skills;
  if (portfolioUrl !== undefined) user.portfolioUrl = portfolioUrl;
  if (githubUrl !== undefined) user.githubUrl = githubUrl;
  if (availability !== undefined) user.availability = availability;

  db.broadcast('user_updated', user);
  res.json({ user });
});
