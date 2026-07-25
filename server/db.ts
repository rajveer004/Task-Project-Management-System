import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import { MongoBoard, MongoTask, MongoUser } from './models/mongoSchemas.js';
import {
  User,
  Board,
  Task,
  Comment,
  ActivityLog,
  AutomationRule,
  Notification,
  SecurityAuditEntry,
  ProjectPosting,
  ProjectApplication,
  TeamChatMessage
} from './types.js';

// Predefined Demo Users with RBAC & Matchmaking Profile Attributes
export const DEFAULT_USERS: User[] = [
  {
    id: 'user_admin_1',
    name: 'Alex Vance',
    email: 'alex.vance@subpilot.io',
    password: 'password123',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    role: 'Admin',
    department: 'Engineering Leadership',
    capacityLimit: 5,
    mfaEnabled: true,
    status: 'active',
    bio: 'Lead Systems Architect & Product Lead building cloud-native collaborative tools.',
    skills: ['TypeScript', 'Node.js', 'System Architecture', 'React', 'MongoDB'],
    portfolioUrl: 'https://alexvance.dev',
    githubUrl: 'https://github.com/alexvance',
    availability: 'Open to Invites'
  },
  {
    id: 'user_lead_2',
    name: 'Rahul Sharma',
    email: 'rahul.sharma@subpilot.io',
    password: 'password123',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    role: 'Member',
    department: 'Full Stack Engineering',
    capacityLimit: 4,
    mfaEnabled: true,
    status: 'active',
    bio: 'Senior Full Stack Engineer passionate about real-time sync engines and high-throughput APIs.',
    skills: ['Node.js', 'Express', 'Socket.io', 'MongoDB', 'Redis', 'Docker'],
    portfolioUrl: 'https://rahulsharma.io',
    githubUrl: 'https://github.com/rahulsharma-dev',
    availability: 'Looking for Projects'
  },
  {
    id: 'user_dev_3',
    name: 'Priya Patel',
    email: 'priya.patel@subpilot.io',
    password: 'password123',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    role: 'Member',
    department: 'Frontend Architecture',
    capacityLimit: 4,
    mfaEnabled: false,
    status: 'active',
    bio: 'Frontend Specialist focusing on Tailwind CSS, micro-interactions, accessibility, and high performance.',
    skills: ['React', 'TypeScript', 'Tailwind CSS', 'Framer Motion', 'Redux', 'Vite'],
    portfolioUrl: 'https://priyapatel.design',
    githubUrl: 'https://github.com/priyapatel-frontend',
    availability: 'Looking for Projects'
  },
  {
    id: 'user_design_4',
    name: 'David Kim',
    email: 'david.kim@subpilot.io',
    password: 'password123',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    role: 'Member',
    department: 'Product Design',
    capacityLimit: 3,
    mfaEnabled: true,
    status: 'away',
    bio: 'Product Designer & Design System Architect creating intuitive developer experience tools.',
    skills: ['Figma', 'UI/UX Design', 'Design Systems', 'Tailwind CSS', 'User Research'],
    portfolioUrl: 'https://davidkim.design',
    githubUrl: 'https://github.com/davidkim-ui',
    availability: 'Open to Invites'
  },
  {
    id: 'user_guest_5',
    name: 'Marcus Miller',
    email: 'marcus.guest@client.com',
    password: 'password123',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    role: 'Guest',
    department: 'External Reviewer',
    capacityLimit: 2,
    mfaEnabled: false,
    status: 'active',
    bio: 'DevOps & Cloud Security Consultant evaluating enterprise workflow compliance.',
    skills: ['DevOps', 'Kubernetes', 'Security Compliance', 'CI/CD', 'AWS'],
    portfolioUrl: 'https://marcusmiller.tech',
    githubUrl: 'https://github.com/marcusmiller-sec',
    availability: 'Busy'
  }
];

const INITIAL_BOARDS: Board[] = [
  {
    id: 'board_subpilot_core',
    name: 'SubPilot Enterprise Core v2.0',
    description: 'Main product engineering roadmap for cloud architecture, real-time collaboration, and AI pipelines.',
    category: 'Engineering',
    isPrivate: false,
    members: [
      { userId: 'user_admin_1', role: 'Owner' },
      { userId: 'user_lead_2', role: 'Admin' },
      { userId: 'user_dev_3', role: 'Member' },
      { userId: 'user_design_4', role: 'Member' },
      { userId: 'user_guest_5', role: 'Viewer' }
    ],
    columns: [
      { id: 'backlog', boardId: 'board_subpilot_core', title: 'Backlog', color: '#64748B', position: 0, limit: 10 },
      { id: 'todo', boardId: 'board_subpilot_core', title: 'To Do', color: '#3B82F6', position: 1, limit: 8 },
      { id: 'in_progress', boardId: 'board_subpilot_core', title: 'In Progress', color: '#EAB308', position: 2, limit: 5 },
      { id: 'review', boardId: 'board_subpilot_core', title: 'In Review', color: '#A855F7', position: 3, limit: 4 },
      { id: 'done', boardId: 'board_subpilot_core', title: 'Done', color: '#22C55E', position: 4 }
    ],
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'board_ai_assistant',
    name: 'AI Agent & LLM Orchestration',
    description: 'SubPilot AI Decomposition & Automated Thread Summarizer microservices.',
    category: 'Artificial Intelligence',
    isPrivate: false,
    members: [
      { userId: 'user_admin_1', role: 'Owner' },
      { userId: 'user_lead_2', role: 'Admin' },
      { userId: 'user_dev_3', role: 'Member' }
    ],
    columns: [
      { id: 'backlog', boardId: 'board_ai_assistant', title: 'Backlog', color: '#64748B', position: 0 },
      { id: 'todo', boardId: 'board_ai_assistant', title: 'To Do', color: '#3B82F6', position: 1 },
      { id: 'in_progress', boardId: 'board_ai_assistant', title: 'In Progress', color: '#EAB308', position: 2 },
      { id: 'review', boardId: 'board_ai_assistant', title: 'In Review', color: '#A855F7', position: 3 },
      { id: 'done', boardId: 'board_ai_assistant', title: 'Done', color: '#22C55E', position: 4 }
    ],
    createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const INITIAL_TASKS: Task[] = [
  {
    id: 'task_101',
    boardId: 'board_subpilot_core',
    listId: 'in_progress',
    title: 'Implement WebSocket / SSE Real-time State Synchronization',
    description: 'Set up real-time server-sent events or Socket handlers to synchronize Kanban card moves across concurrent browser sessions instantly without reloading.',
    priority: 'Urgent',
    tags: ['Backend', 'WebSockets', 'Architecture'],
    assignees: ['user_lead_2', 'user_dev_3'],
    dueDate: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
    startDate: new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0],
    estimatedHours: 16,
    actualHours: 10,
    coverImage: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80',
    subtasks: [
      { id: 'sub_1', title: 'Define SSE broadcast channel contract', completed: true, estimatedHours: 3 },
      { id: 'sub_2', title: 'Connect Client event listener in React BoardContext', completed: true, estimatedHours: 4 },
      { id: 'sub_3', title: 'Add active presence avatar indicators', completed: false, estimatedHours: 5 },
      { id: 'sub_4', title: 'Write load resilience tests', completed: false, estimatedHours: 4 }
    ],
    attachments: [
      { id: 'att_1', name: 'Realtime_Architecture_Diag.pdf', url: '#', size: '2.4 MB', uploadedAt: 'Yesterday', type: 'application/pdf' }
    ],
    position: 0,
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'task_102',
    boardId: 'board_subpilot_core',
    listId: 'todo',
    title: 'Audit Role-Based Access Control (RBAC) & Security Logs',
    description: 'Ensure Admin, Member, and Guest policies prevent unauthorized task deletion and system configuration edits. Implement downloadable compliance reports.',
    priority: 'High',
    tags: ['Security', 'RBAC', 'Compliance'],
    assignees: ['user_admin_1'],
    dueDate: new Date(Date.now() + 4 * 86400000).toISOString().split('T')[0],
    startDate: new Date(Date.now()).toISOString().split('T')[0],
    estimatedHours: 12,
    actualHours: 2,
    subtasks: [
      { id: 'sub_201', title: 'Implement RBAC middleware for Express routes', completed: true, estimatedHours: 4 },
      { id: 'sub_202', title: 'Create Security Dashboard UI modal', completed: false, estimatedHours: 4 },
      { id: 'sub_203', title: 'Add CSV / JSON audit export endpoint', completed: false, estimatedHours: 4 }
    ],
    attachments: [],
    position: 1,
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'task_103',
    boardId: 'board_subpilot_core',
    listId: 'review',
    title: 'Gantt & Timeline Interactive Drag Controls',
    description: 'Build interactive timeline chart where users can drag start/end date handles to recalculate project durations dynamically.',
    priority: 'High',
    tags: ['Frontend', 'Gantt', 'UX'],
    assignees: ['user_dev_3', 'user_design_4'],
    dueDate: new Date(Date.now() + 1 * 86400000).toISOString().split('T')[0],
    startDate: new Date(Date.now() - 6 * 86400000).toISOString().split('T')[0],
    estimatedHours: 20,
    actualHours: 18,
    coverImage: 'https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?w=800&auto=format&fit=crop&q=80',
    subtasks: [
      { id: 'sub_301', title: 'Design Gantt bar layout', completed: true, estimatedHours: 6 },
      { id: 'sub_302', title: 'Add drag event handlers for date adjustments', completed: true, estimatedHours: 8 },
      { id: 'sub_303', title: 'Connect with global task state updates', completed: true, estimatedHours: 6 }
    ],
    attachments: [],
    position: 0,
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'task_104',
    boardId: 'board_subpilot_core',
    listId: 'done',
    title: 'Dark & Light Theme Tokens in Tailwind',
    description: 'Ensure crisp contrast ratios, WCAG compliance, and dark slate backgrounds for developer workspace preferences.',
    priority: 'Medium',
    tags: ['Design', 'Tailwind', 'UI'],
    assignees: ['user_design_4'],
    dueDate: new Date(Date.now() - 1 * 86400000).toISOString().split('T')[0],
    startDate: new Date(Date.now() - 8 * 86400000).toISOString().split('T')[0],
    estimatedHours: 8,
    actualHours: 7,
    subtasks: [
      { id: 'sub_401', title: 'Define slate neutral color palette', completed: true, estimatedHours: 4 },
      { id: 'sub_402', title: 'Refactor modals and dropdowns', completed: true, estimatedHours: 4 }
    ],
    attachments: [],
    position: 0,
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'task_105',
    boardId: 'board_subpilot_core',
    listId: 'backlog',
    title: 'Automated Multi-Factor Authentication (MFA) Enforcer',
    description: 'Prompt users with optional 2FA verification codes upon sensitive actions or login from new client IPs.',
    priority: 'Low',
    tags: ['Auth', 'MFA', 'Security'],
    assignees: ['user_admin_1'],
    dueDate: new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0],
    startDate: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
    estimatedHours: 14,
    actualHours: 0,
    subtasks: [
      { id: 'sub_501', title: 'Design 6-digit TOTP input modal', completed: false, estimatedHours: 4 },
      { id: 'sub_502', title: 'Store verification state in JWT session', completed: false, estimatedHours: 6 }
    ],
    attachments: [],
    position: 0,
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const INITIAL_COMMENTS: Comment[] = [
  {
    id: 'comm_101',
    taskId: 'task_101',
    userId: 'user_lead_2',
    userName: 'Rahul Sharma',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    content: 'I set up the Server-Sent Events endpoint on Express. @Priya Patel can you review the client connection handling in BoardContext?',
    createdAt: new Date(Date.now() - 1200000).toISOString(),
    mentions: ['Priya Patel']
  },
  {
    id: 'comm_102',
    taskId: 'task_101',
    userId: 'user_dev_3',
    userName: 'Priya Patel',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    content: 'Checked the client connection! Auto-reconnect and instant state refresh work smooth on card drag.',
    createdAt: new Date(Date.now() - 600000).toISOString()
  }
];

const INITIAL_ACTIVITIES: ActivityLog[] = [
  {
    id: 'act_1',
    taskId: 'task_101',
    boardId: 'board_subpilot_core',
    userId: 'user_lead_2',
    userName: 'Rahul Sharma',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    action: 'moved card from To Do to In Progress',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    type: 'task'
  },
  {
    id: 'act_2',
    boardId: 'board_subpilot_core',
    userId: 'user_admin_1',
    userName: 'Alex Vance',
    userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    action: 'enabled Automation Rule: "Auto-assign to Team Lead on In Review"',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    type: 'board'
  }
];

const INITIAL_AUTOMATIONS: AutomationRule[] = [
  {
    id: 'rule_1',
    boardId: 'board_subpilot_core',
    name: 'Auto-Assign Lead on Review',
    triggerEvent: 'status_changed',
    triggerValue: 'review',
    actionType: 'auto_assign',
    actionValue: 'user_lead_2',
    enabled: true,
    createdAt: new Date().toISOString(),
    runCount: 3,
    lastTriggeredAt: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 'rule_2',
    boardId: 'board_subpilot_core',
    name: 'Notify Admin on Urgent Priority',
    triggerEvent: 'priority_changed',
    triggerValue: 'Urgent',
    actionType: 'send_notification',
    actionValue: 'user_admin_1',
    enabled: true,
    createdAt: new Date().toISOString(),
    runCount: 1,
    lastTriggeredAt: new Date(Date.now() - 7200000).toISOString()
  },
  {
    id: 'rule_3',
    boardId: 'board_subpilot_core',
    name: 'Auto-Tag Compliance on Created Tasks',
    triggerEvent: 'task_created',
    triggerValue: 'all',
    actionType: 'add_tag',
    actionValue: 'Compliance',
    enabled: true,
    createdAt: new Date().toISOString(),
    runCount: 0
  }
];

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif_1',
    userId: 'user_lead_2',
    title: 'Task Mentioned',
    message: 'Alex Vance mentioned you in "Implement WebSocket State Synchronization"',
    type: 'mention',
    read: false,
    createdAt: new Date(Date.now() - 1800000).toISOString(),
    linkTaskId: 'task_101'
  },
  {
    id: 'notif_2',
    userId: 'user_admin_1',
    title: 'Security Notice',
    message: 'Security Audit Log downloaded by Admin Alex Vance',
    type: 'security',
    read: true,
    createdAt: new Date(Date.now() - 86400000).toISOString()
  }
];

const INITIAL_SECURITY_LOGS: SecurityAuditEntry[] = [
  {
    id: 'sec_1',
    timestamp: new Date(Date.now() - 10000).toISOString(),
    userId: 'user_admin_1',
    userName: 'Alex Vance',
    userEmail: 'alex.vance@subpilot.io',
    action: 'USER_AUTHENTICATED_MFA_VERIFIED',
    ipAddress: '192.168.1.102',
    severity: 'low',
    details: 'User completed JWT OAuth authentication with MFA enabled.'
  },
  {
    id: 'sec_2',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    userId: 'user_lead_2',
    userName: 'Rahul Sharma',
    userEmail: 'rahul.sharma@subpilot.io',
    action: 'BOARD_AUTOMATION_EXECUTION',
    ipAddress: '10.0.4.15',
    severity: 'low',
    details: 'Automation triggered: Status changed to review -> auto-assigned to Rahul Sharma.'
  }
];

const INITIAL_POSTINGS: ProjectPosting[] = [
  {
    id: 'post_1',
    title: 'Autonomous AI Code Agent & Review Engine',
    description: 'Building a multi-agent orchestration pipeline that automatically reviews pull requests, generates test cases, and decomposes feature requirements into subtasks.',
    ownerId: 'user_admin_1',
    ownerName: 'Alex Vance',
    ownerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    rolesNeeded: ['Frontend Lead', 'AI/LLM Engineer', 'UI/UX Designer'],
    requiredSkills: ['React', 'TypeScript', 'Gemini API', 'Tailwind CSS', 'Node.js'],
    targetTeamSize: 5,
    currentMemberCount: 3,
    status: 'Recruiting',
    boardId: 'board_ai_assistant',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: 'post_2',
    title: 'SubPilot High-Density Realtime Workspace v2.0',
    description: 'Scaling our collaborative task board to support 100+ concurrent editors per workspace with conflict-free state synchronization and low latency audio/video presence.',
    ownerId: 'user_lead_2',
    ownerName: 'Rahul Sharma',
    ownerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    rolesNeeded: ['Backend Architect', 'DevOps Specialist'],
    requiredSkills: ['Node.js', 'Socket.io', 'Redis', 'Docker', 'Kubernetes'],
    targetTeamSize: 4,
    currentMemberCount: 2,
    status: 'Recruiting',
    boardId: 'board_subpilot_core',
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString()
  },
  {
    id: 'post_3',
    title: 'Mobile Companion & Push Notification Hub',
    description: 'Developing cross-platform React Native companion app for SubPilot task approvals, quick voice notes, and instant security alert response.',
    ownerId: 'user_dev_3',
    ownerName: 'Priya Patel',
    ownerAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    rolesNeeded: ['Mobile Engineer', 'Backend Dev'],
    requiredSkills: ['React Native', 'Expo', 'GraphQL', 'Firebase Cloud Messaging'],
    targetTeamSize: 3,
    currentMemberCount: 1,
    status: 'Recruiting',
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString()
  }
];

const INITIAL_APPLICATIONS: ProjectApplication[] = [
  {
    id: 'app_1',
    projectId: 'post_1',
    projectTitle: 'Autonomous AI Code Agent & Review Engine',
    applicantId: 'user_dev_3',
    applicantName: 'Priya Patel',
    applicantAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    applicantSkills: ['React', 'TypeScript', 'Tailwind CSS', 'Framer Motion'],
    pitchMessage: 'Hey Alex! I have extensive experience building interactive AI interfaces and responsive dashboards. I would love to lead the frontend architecture for the AI Agent workspace!',
    roleRequested: 'Frontend Lead',
    status: 'Pending',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString()
  },
  {
    id: 'app_2',
    projectId: 'post_2',
    projectTitle: 'SubPilot High-Density Realtime Workspace v2.0',
    applicantId: 'user_guest_5',
    applicantName: 'Marcus Miller',
    applicantAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    applicantSkills: ['DevOps', 'Kubernetes', 'CI/CD', 'AWS'],
    pitchMessage: 'I can optimize the Docker container deployment and Redis pub/sub layer to ensure zero-downtime scaling under heavy traffic.',
    roleRequested: 'DevOps Specialist',
    status: 'Pending',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString()
  }
];

const INITIAL_CHAT_MESSAGES: TeamChatMessage[] = [
  {
    id: 'chat_1',
    boardId: 'board_subpilot_core',
    senderId: 'user_admin_1',
    senderName: 'Alex Vance',
    senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    message: 'Welcome everyone to the SubPilot Core workspace channel! Let us kick off the WebSocket synchronization sprint.',
    timestamp: new Date(Date.now() - 3600000 * 4).toISOString()
  },
  {
    id: 'chat_2',
    boardId: 'board_subpilot_core',
    senderId: 'user_lead_2',
    senderName: 'Rahul Sharma',
    senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    message: 'Awesome! SSE stream is live and broadcasting card movements in real-time.',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString()
  }
];

// Data Store in Memory + local file backup
export class Database {
  users: User[] = [...DEFAULT_USERS];
  boards: Board[] = [...INITIAL_BOARDS];
  tasks: Task[] = [...INITIAL_TASKS];
  comments: Comment[] = [...INITIAL_COMMENTS];
  activities: ActivityLog[] = [...INITIAL_ACTIVITIES];
  automations: AutomationRule[] = [...INITIAL_AUTOMATIONS];
  notifications: Notification[] = [...INITIAL_NOTIFICATIONS];
  securityLogs: SecurityAuditEntry[] = [...INITIAL_SECURITY_LOGS];
  projectPostings: ProjectPosting[] = [...INITIAL_POSTINGS];
  applications: ProjectApplication[] = [...INITIAL_APPLICATIONS];
  chatMessages: TeamChatMessage[] = [...INITIAL_CHAT_MESSAGES];

  // Realtime subscription listeners for Server-Sent Events
  private sseClients: Array<(data: any) => void> = [];

  constructor() {
    this.loadFromDisk();
    this.syncFromMongoDB();
  }

  subscribe(listener: (data: any) => void) {
    this.sseClients.push(listener);
    return () => {
      this.sseClients = this.sseClients.filter(l => l !== listener);
    };
  }

  broadcast(event: string, payload: any) {
    const data = JSON.stringify({ event, payload, timestamp: new Date().toISOString() });
    this.sseClients.forEach(client => client(data));
    this.saveToDisk();
  }

  private getStoragePath() {
    return path.join(process.cwd(), '.subpilot_data.json');
  }

  private saveToDisk() {
    try {
      const data = {
        users: this.users,
        boards: this.boards,
        tasks: this.tasks,
        comments: this.comments,
        activities: this.activities,
        automations: this.automations,
        notifications: this.notifications,
        securityLogs: this.securityLogs,
        projectPostings: this.projectPostings,
        applications: this.applications,
        chatMessages: this.chatMessages
      };
      fs.writeFileSync(this.getStoragePath(), JSON.stringify(data, null, 2), 'utf-8');
      this.syncToMongoDB();
    } catch (err) {
      // ignore write errors in sandbox
    }
  }

  private loadFromDisk() {
    try {
      const file = this.getStoragePath();
      if (fs.existsSync(file)) {
        const raw = fs.readFileSync(file, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed.boards && parsed.tasks) {
          this.users = parsed.users || DEFAULT_USERS;
          this.boards = parsed.boards;
          this.tasks = parsed.tasks;
          this.comments = parsed.comments || [];
          this.activities = parsed.activities || [];
          this.automations = parsed.automations || [];
          this.notifications = parsed.notifications || [];
          this.securityLogs = parsed.securityLogs || [];
          this.projectPostings = parsed.projectPostings || INITIAL_POSTINGS;
          this.applications = parsed.applications || INITIAL_APPLICATIONS;
          this.chatMessages = parsed.chatMessages || INITIAL_CHAT_MESSAGES;
        }
      }
    } catch (e) {
      // fallback to initial
    }
  }

  private async syncFromMongoDB() {
    try {
      // Wait for MongoDB to connect if it's currently connecting
      if (mongoose.connection.readyState === 2) {
        await new Promise((resolve) => {
          mongoose.connection.once('connected', resolve);
        });
      }

      if (mongoose.connection.readyState === 1) {
        console.log('[MongoDB] Connection verified. Fetching active collections...');

        // Fetch Users
        const dbUsers = await MongoUser.find({});
        if (dbUsers.length > 0) {
          this.users = dbUsers.map(u => {
            const obj = u.toObject();
            delete obj._id;
            delete obj.__v;
            return obj as unknown as User;
          });
        } else {
          await MongoUser.insertMany(DEFAULT_USERS);
          console.log('[MongoDB] Seeded default users to MongoDB.');
        }

        // Fetch Boards
        const dbBoards = await MongoBoard.find({});
        if (dbBoards.length > 0) {
          this.boards = dbBoards.map(b => {
            const obj = b.toObject();
            delete obj._id;
            delete obj.__v;
            return obj as unknown as Board;
          });
        } else {
          await MongoBoard.insertMany(INITIAL_BOARDS);
          console.log('[MongoDB] Seeded initial boards to MongoDB.');
        }

        // Fetch Tasks
        const dbTasks = await MongoTask.find({});
        if (dbTasks.length > 0) {
          this.tasks = dbTasks.map(t => {
            const obj = t.toObject();
            delete obj._id;
            delete obj.__v;
            return obj as unknown as Task;
          });
        } else {
          await MongoTask.insertMany(INITIAL_TASKS);
          console.log('[MongoDB] Seeded initial tasks to MongoDB.');
        }
      }
    } catch (err: any) {
      console.error('[MongoDB] Failed to sync database from MongoDB Atlas:', err.message);
    }
  }

  private async syncToMongoDB() {
    if (mongoose.connection.readyState !== 1) return;
    try {
      // 1. Sync Users
      const userIds = this.users.map(u => u.id);
      await MongoUser.deleteMany({ id: { $nin: userIds } });
      for (const user of this.users) {
        await MongoUser.findOneAndUpdate({ id: user.id }, user, { upsert: true, new: true });
      }

      // 2. Sync Boards
      const boardIds = this.boards.map(b => b.id);
      await MongoBoard.deleteMany({ id: { $nin: boardIds } });
      for (const board of this.boards) {
        await MongoBoard.findOneAndUpdate({ id: board.id }, board, { upsert: true, new: true });
      }

      // 3. Sync Tasks
      const taskIds = this.tasks.map(t => t.id);
      await MongoTask.deleteMany({ id: { $nin: taskIds } });
      for (const task of this.tasks) {
        await MongoTask.findOneAndUpdate({ id: task.id }, task, { upsert: true, new: true });
      }

      console.log('[MongoDB] Successfully synchronized data changes to MongoDB Atlas.');
    } catch (err: any) {
      console.error('[MongoDB] Failed to sync data to MongoDB Atlas:', err.message);
    }
  }

  // Security Audit logger
  logSecurity(userId: string, userName: string, userEmail: string, action: string, details: string, severity: 'low' | 'medium' | 'high' | 'critical' = 'low') {
    const entry: SecurityAuditEntry = {
      id: `sec_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      userId,
      userName,
      userEmail,
      action,
      ipAddress: '127.0.0.1',
      severity,
      details
    };
    this.securityLogs.unshift(entry);
    this.broadcast('security_log_created', entry);
    return entry;
  }
}

export const db = new Database();
