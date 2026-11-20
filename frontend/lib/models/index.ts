import mongoose, { Schema, Model } from 'mongoose';

// ─── User Schema ─────────────────────────────────────────────────────────────
export interface IUserDocument {
  id: string;
  name: string;
  email: string;
  password?: string;
  avatarUrl?: string;
  avatarColor: string;
  createdAt: string;
  updatedAt: string;
}

const UserSchema = new Schema<IUserDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    password: { type: String, required: true },
    avatarUrl: { type: String },
    avatarColor: { type: String, default: '#6366f1' },
  },
  { timestamps: true }
);

// ─── Workspace Schema ────────────────────────────────────────────────────────
export interface IWorkspaceDocument {
  id: string;
  name: string;
  description?: string;
  icon: string;
  color: string;
  ownerId: string;
  defaultView: 'kanban' | 'list' | 'calendar';
  createdAt: string;
  updatedAt: string;
}

const WorkspaceSchema = new Schema<IWorkspaceDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    icon: { type: String, default: '🚀' },
    color: { type: String, default: '#6366f1' },
    ownerId: { type: String, required: true, index: true },
    defaultView: { type: String, enum: ['kanban', 'list', 'calendar'], default: 'kanban' },
  },
  { timestamps: true }
);

// ─── Workspace Member Schema ─────────────────────────────────────────────────
export interface IWorkspaceMemberDocument {
  id: string;
  workspaceId: string;
  userId: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  joinedAt: string;
}

const WorkspaceMemberSchema = new Schema<IWorkspaceMemberDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    workspaceId: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    role: { type: String, enum: ['owner', 'admin', 'member', 'viewer'], default: 'member' },
    joinedAt: { type: String, default: () => new Date().toISOString() },
  },
  { timestamps: true }
);

// ─── Project Schema ──────────────────────────────────────────────────────────
export interface IProjectDocument {
  id: string;
  workspaceId: string;
  name: string;
  description?: string;
  icon: string;
  color: string;
  status: 'active' | 'archived';
  defaultView: 'kanban' | 'list' | 'calendar';
  template?: string;
  memberIds: string[];
  columns: Array<{
    id: string;
    title: string;
    status: string;
    order: number;
    color?: string;
  }>;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

const ProjectSchema = new Schema<IProjectDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    workspaceId: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    icon: { type: String, default: '📁' },
    color: { type: String, default: '#3b82f6' },
    status: { type: String, enum: ['active', 'archived'], default: 'active' },
    defaultView: { type: String, enum: ['kanban', 'list', 'calendar'], default: 'kanban' },
    template: { type: String, default: 'software-development' },
    memberIds: { type: [String], default: [] },
    columns: {
      type: [
        {
          id: { type: String, required: true },
          title: { type: String, required: true },
          status: { type: String, required: true },
          order: { type: Number, required: true },
          color: { type: String },
        },
      ],
      default: [],
    },
    createdBy: { type: String, required: true },
  },
  { timestamps: true }
);

// ─── Task Schema ─────────────────────────────────────────────────────────────
export interface ITaskDocument {
  id: string;
  projectId: string;
  workspaceId: string;
  parentTaskId?: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  dueDate?: string;
  assigneeId?: string;
  labelIds: string[];
  attachmentIds: string[];
  order: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

const TaskSchema = new Schema<ITaskDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    projectId: { type: String, required: true, index: true },
    workspaceId: { type: String, required: true, index: true },
    parentTaskId: { type: String },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    status: { type: String, required: true, default: 'todo' },
    priority: { type: String, enum: ['urgent', 'high', 'medium', 'low', 'none'], default: 'medium' },
    dueDate: { type: String },
    assigneeId: { type: String },
    labelIds: { type: [String], default: [] },
    attachmentIds: { type: [String], default: [] },
    order: { type: Number, default: 0 },
    createdBy: { type: String, required: true },
  },
  { timestamps: true }
);

// ─── Comment Schema ──────────────────────────────────────────────────────────
export interface ICommentDocument {
  id: string;
  taskId: string;
  userId: string;
  content: string;
  attachments?: any[];
  createdAt: string;
  updatedAt: string;
}

const CommentSchema = new Schema<ICommentDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    taskId: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    content: { type: String, required: true },
    attachments: { type: Array, default: [] },
  },
  { timestamps: true }
);

// ─── Activity Schema ─────────────────────────────────────────────────────────
export interface IActivityDocument {
  id: string;
  workspaceId: string;
  projectId?: string;
  taskId?: string;
  actorId: string;
  action: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

const ActivitySchema = new Schema<IActivityDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    workspaceId: { type: String, required: true, index: true },
    projectId: { type: String, index: true },
    taskId: { type: String, index: true },
    actorId: { type: String, required: true },
    action: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

// ─── Notification Schema ─────────────────────────────────────────────────────
export interface INotificationDocument {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  taskId?: string;
  projectId?: string;
  workspaceId?: string;
  read: boolean;
  createdAt: string;
}

const NotificationSchema = new Schema<INotificationDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    type: { type: String, required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    taskId: { type: String },
    projectId: { type: String },
    workspaceId: { type: String },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// ─── Label Schema ────────────────────────────────────────────────────────────
export interface ILabelDocument {
  id: string;
  workspaceId: string;
  name: string;
  color: string;
}

const LabelSchema = new Schema<ILabelDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    workspaceId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    color: { type: String, required: true },
  },
  { timestamps: true }
);

// ─── Model Singletons (prevent Next.js HMR recompilation duplicates) ──────────
export const UserModel: Model<IUserDocument> =
  mongoose.models.User || mongoose.model<IUserDocument>('User', UserSchema);

export const WorkspaceModel: Model<IWorkspaceDocument> =
  mongoose.models.Workspace || mongoose.model<IWorkspaceDocument>('Workspace', WorkspaceSchema);

export const WorkspaceMemberModel: Model<IWorkspaceMemberDocument> =
  mongoose.models.WorkspaceMember ||
  mongoose.model<IWorkspaceMemberDocument>('WorkspaceMember', WorkspaceMemberSchema);

export const ProjectModel: Model<IProjectDocument> =
  mongoose.models.Project || mongoose.model<IProjectDocument>('Project', ProjectSchema);

export const TaskModel: Model<ITaskDocument> =
  mongoose.models.Task || mongoose.model<ITaskDocument>('Task', TaskSchema);

export const CommentModel: Model<ICommentDocument> =
  mongoose.models.Comment || mongoose.model<ICommentDocument>('Comment', CommentSchema);

export const ActivityModel: Model<IActivityDocument> =
  mongoose.models.Activity || mongoose.model<IActivityDocument>('Activity', ActivitySchema);

export const NotificationModel: Model<INotificationDocument> =
  mongoose.models.Notification || mongoose.model<INotificationDocument>('Notification', NotificationSchema);

export const LabelModel: Model<ILabelDocument> =
  mongoose.models.Label || mongoose.model<ILabelDocument>('Label', LabelSchema);
