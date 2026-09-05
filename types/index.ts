// ─── Core Enums / Literals ───────────────────────────────────────────────────

export type Role = 'owner' | 'admin' | 'member' | 'viewer';

export type TaskStatus =
  | 'backlog'
  | 'todo'
  | 'in-progress'
  | 'review'
  | 'done';

export type Priority = 'urgent' | 'high' | 'medium' | 'low' | 'none';

export type ViewType = 'kanban' | 'list' | 'calendar';

export type NotificationType =
  | 'task_assigned'
  | 'task_mentioned'
  | 'due_date_approaching'
  | 'comment_added'
  | 'task_completed'
  | 'member_added';

export type ActivityAction =
  | 'task_created'
  | 'task_updated'
  | 'task_deleted'
  | 'status_changed'
  | 'assignee_changed'
  | 'priority_changed'
  | 'due_date_changed'
  | 'comment_added'
  | 'comment_edited'
  | 'comment_deleted'
  | 'attachment_added'
  | 'attachment_removed'
  | 'label_added'
  | 'label_removed'
  | 'subtask_created'
  | 'task_moved'
  | 'member_added'
  | 'member_removed'
  | 'project_created'
  | 'project_archived'
  | 'project_deleted';

export type ProjectTemplate =
  | 'software-development'
  | 'website-project'
  | 'marketing-campaign'
  | 'product-launch'
  | 'blank';

// ─── User ────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  avatarColor: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthSession {
  userId: string;
  token: string;
  expiresAt: string;
}

// ─── Workspace ───────────────────────────────────────────────────────────────

export interface Workspace {
  id: string;
  name: string;
  description?: string;
  icon: string;
  color: string;
  ownerId: string;
  defaultView: ViewType;
  createdAt: string;
  updatedAt: string;
}

export interface WorkspaceMember {
  id: string;
  workspaceId: string;
  userId: string;
  role: Role;
  joinedAt: string;
}

// ─── Project ─────────────────────────────────────────────────────────────────

export interface Project {
  id: string;
  workspaceId: string;
  name: string;
  description?: string;
  icon: string;
  color: string;
  status: 'active' | 'archived';
  defaultView: ViewType;
  template?: ProjectTemplate;
  memberIds: string[];
  columns: KanbanColumn[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface KanbanColumn {
  id: string;
  title: string;
  status: TaskStatus;
  order: number;
  color?: string;
}

// ─── Label ───────────────────────────────────────────────────────────────────

export interface Label {
  id: string;
  workspaceId: string;
  name: string;
  color: string;
}

// ─── Task ────────────────────────────────────────────────────────────────────

export interface Task {
  id: string;
  projectId: string;
  workspaceId: string;
  parentTaskId?: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  dueDate?: string;
  assigneeId?: string;
  labelIds: string[];
  attachmentIds: string[];
  order: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Attachment ──────────────────────────────────────────────────────────────

export interface Attachment {
  id: string;
  taskId: string;
  name: string;
  mimeType: string;
  size: number;
  createdBy: string;
  createdAt: string;
}

// ─── Comment ─────────────────────────────────────────────────────────────────

export interface Comment {
  id: string;
  taskId: string;
  authorId: string;
  content: string;
  mentions: string[];
  editedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Activity ────────────────────────────────────────────────────────────────

export interface Activity {
  id: string;
  workspaceId: string;
  projectId?: string;
  taskId?: string;
  actorId: string;
  action: ActivityAction;
  metadata: Record<string, unknown>;
  createdAt: string;
}

// ─── Notification ────────────────────────────────────────────────────────────

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  taskId?: string;
  projectId?: string;
  workspaceId?: string;
  read: boolean;
  createdAt: string;
}

// ─── Settings ────────────────────────────────────────────────────────────────

export interface NotificationPreferences {
  taskAssignments: boolean;
  mentions: boolean;
  dueDateApproaching: boolean;
  commentAdded: boolean;
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  defaultView: ViewType;
  compactMode: boolean;
  notificationPreferences: NotificationPreferences;
  language: string;
}

// ─── Filter / Sort ───────────────────────────────────────────────────────────

export type SortField = 'dueDate' | 'priority' | 'createdAt' | 'title' | 'status';
export type SortDirection = 'asc' | 'desc';
export type GroupByField = 'status' | 'assignee' | 'priority' | 'label' | 'none';

export interface TaskFilter {
  assigneeIds?: string[];
  labelIds?: string[];
  priorities?: Priority[];
  statuses?: TaskStatus[];
  dueDateFrom?: string;
  dueDateTo?: string;
  search?: string;
}

export interface TaskSort {
  field: SortField;
  direction: SortDirection;
}

export interface FilterPreset {
  id: string;
  workspaceId: string;
  userId: string;
  name: string;
  filter: TaskFilter;
  sort?: TaskSort;
  groupBy?: GroupByField;
  createdAt: string;
}

// ─── UI State ────────────────────────────────────────────────────────────────

export interface ToastItem {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
}

// ─── Import/Export ───────────────────────────────────────────────────────────

export interface ExportData {
  version: string;
  exportedAt: string;
  workspace: Workspace;
  members: WorkspaceMember[];
  users: User[];
  projects: Project[];
  tasks: Task[];
  comments: Comment[];
  activities: Activity[];
  labels: Label[];
  filterPresets: FilterPreset[];
  notifications?: Notification[];
  settings: AppSettings;
}

// ─── Command Palette ─────────────────────────────────────────────────────────

export interface CommandItem {
  id: string;
  title: string;
  description?: string;
  icon?: string;
  shortcut?: string;
  action: () => void;
  group?: string;
  keywords?: string[];
}
