export type UserRole = 'Owner' | 'Admin' | 'Member' | 'Guest';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  avatar: string;
  role: UserRole;
  department?: string;
  capacityLimit?: number;
  mfaEnabled?: boolean;
  status?: 'active' | 'busy' | 'offline' | 'away';
  bio?: string;
  skills?: string[];
  hourlyRate?: number;
  availability?: string;
  rating?: number;
  portfolioUrl?: string;
  githubUrl?: string;
}

export type PriorityLevel = 'Urgent' | 'High' | 'Medium' | 'Low';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  estimatedHours?: number;
}

export interface TaskAttachment {
  id: string;
  name: string;
  url: string;
  size?: string;
  uploadedAt?: string;
  type?: string;
}

export interface Task {
  id: string;
  boardId: string;
  listId: string;
  title: string;
  description: string;
  priority: PriorityLevel;
  assignees: string[];
  tags: string[];
  dueDate?: string;
  startDate?: string;
  estimatedHours?: number;
  actualHours?: number;
  subtasks: Subtask[];
  createdAt: string;
  updatedAt: string;
  order?: number;
  position?: number;
  coverImage?: string;
  attachments?: (string | TaskAttachment)[];
}

export interface Column {
  id: string;
  title: string;
  order?: number;
  position?: number;
  boardId?: string;
  color?: string;
  limit?: number;
}

export interface BoardMemberObject {
  userId: string;
  role: string;
}

export interface Board {
  id: string;
  name: string;
  description?: string;
  category?: string;
  ownerId?: string;
  members: (string | BoardMemberObject)[];
  columns: Column[];
  isPrivate?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  taskId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  createdAt: string;
  mentions?: string[];
}

export interface ActivityLog {
  id: string;
  taskId?: string;
  boardId?: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  action: string;
  timestamp: string;
  type?: string;
}

export interface AutomationRule {
  id: string;
  boardId: string;
  name: string;
  triggerEvent: 'status_changed' | 'priority_changed' | 'due_date_approaching' | 'task_created' | 'tag_added';
  triggerValue: string;
  actionType: 'auto_assign' | 'send_notification' | 'move_list' | 'set_priority' | 'add_tag';
  actionValue: string;
  enabled: boolean;
  createdAt: string;
  lastTriggeredAt?: string;
  runCount?: number;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  type: 'mention' | 'assignment' | 'automation' | 'matchmaking' | 'security' | 'application';
  linkTaskId?: string;
  linkProjectId?: string;
}

export interface SecurityAuditEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userEmail?: string;
  action: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  ipAddress?: string;
  details?: string;
}

export interface ProjectPosting {
  id: string;
  boardId?: string;
  boardName?: string;
  title: string;
  description: string;
  requiredSkills: string[];
  budgetEstimated?: number;
  status: 'open' | 'matched' | 'closed' | 'Recruiting' | 'In Progress';
  postedByUserId?: string;
  ownerId?: string;
  ownerName?: string;
  ownerAvatar?: string;
  rolesNeeded?: string[];
  currentMemberCount?: number;
  targetTeamSize?: number;
  createdAt: string;
  applicantsCount?: number;
}

export interface ProjectApplication {
  id: string;
  postingId?: string;
  applicantUserId?: string;
  applicantId?: string;
  projectId?: string;
  projectTitle?: string;
  roleRequested?: string;
  applicantName: string;
  applicantAvatar?: string;
  applicantRole?: string;
  applicantSkills?: string[];
  pitchNote?: string;
  pitchMessage?: string;
  status: 'pending' | 'accepted' | 'declined' | 'Pending';
  appliedAt?: string;
  createdAt?: string;
}

export interface TeamChatMessage {
  id: string;
  boardId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  message: string;
  timestamp: string;
}

export interface CapacityMetric {
  user: User;
  activeTasks: number;
  completedTasks: number;
  overdueTasks: number;
  capacityLimit: number;
  isOverloaded: boolean;
}

export interface AiTaskDecompositionResult {
  title: string;
  suggestedDescription: string;
  suggestedPriority: PriorityLevel;
  suggestedTags: string[];
  estimatedTimeHours: number;
  subtasks: {
    title: string;
    estimatedHours: number;
  }[];
}
