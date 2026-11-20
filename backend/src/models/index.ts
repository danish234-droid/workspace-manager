import mongoose, { Schema, Document, Model } from 'mongoose';

// ─── User ────────────────────────────────────────────────────────────────────
export interface IUser extends Document {
  id: string;
  name: string;
  email: string;
  password?: string;
  avatarUrl?: string;
  avatarColor: string;
  bio?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    password: { type: String, required: true },
    avatarUrl: { type: String, default: '' },
    avatarColor: { type: String, default: '#6366f1' },
    bio: { type: String, default: '' },
  },
  { timestamps: true }
);

// ─── Workspace ───────────────────────────────────────────────────────────────
export interface IWorkspace extends Document {
  id: string;
  name: string;
  description?: string;
  icon: string;
  color: string;
  ownerId: string;
  defaultView: 'kanban' | 'list' | 'calendar';
  createdAt: Date;
  updatedAt: Date;
}

const WorkspaceSchema = new Schema<IWorkspace>(
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

// ─── Workspace Member ────────────────────────────────────────────────────────
export interface IWorkspaceMember extends Document {
  id: string;
  workspaceId: string;
  userId: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  joinedAt: string;
}

const WorkspaceMemberSchema = new Schema<IWorkspaceMember>(
  {
    id: { type: String, required: true, unique: true, index: true },
    workspaceId: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    role: { type: String, enum: ['owner', 'admin', 'member', 'viewer'], default: 'member' },
    joinedAt: { type: String, default: () => new Date().toISOString() },
  },
  { timestamps: true }
);

// ─── Project ─────────────────────────────────────────────────────────────────
export interface IProject extends Document {
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
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>(
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

// ─── Task ────────────────────────────────────────────────────────────────────
export interface ITask extends Document {
  id: string;
  projectId: string;
  workspaceId: string;
  parentTaskId?: string;
  title: string;
  description?: string;
  status: string;
  priority: 'urgent' | 'high' | 'medium' | 'low' | 'none';
  dueDate?: string;
  assigneeId?: string;
  labelIds: string[];
  attachmentIds: string[];
  order: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema = new Schema<ITask>(
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

// ─── Comment ─────────────────────────────────────────────────────────────────
export interface IComment extends Document {
  id: string;
  taskId: string;
  userId: string;
  content: string;
  attachments?: any[];
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema = new Schema<IComment>(
  {
    id: { type: String, required: true, unique: true, index: true },
    taskId: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    content: { type: String, required: true },
    attachments: { type: Array, default: [] },
  },
  { timestamps: true }
);

// ─── Activity ────────────────────────────────────────────────────────────────
export interface IActivity extends Document {
  id: string;
  workspaceId: string;
  projectId?: string;
  taskId?: string;
  actorId: string;
  action: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

const ActivitySchema = new Schema<IActivity>(
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

// ─── Notification ────────────────────────────────────────────────────────────
export interface INotification extends Document {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  taskId?: string;
  projectId?: string;
  workspaceId?: string;
  read: boolean;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
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

// ─── Label ───────────────────────────────────────────────────────────────────
export interface ILabel extends Document {
  id: string;
  workspaceId: string;
  name: string;
  color: string;
}

const LabelSchema = new Schema<ILabel>(
  {
    id: { type: String, required: true, unique: true, index: true },
    workspaceId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    color: { type: String, required: true },
  },
  { timestamps: true }
);

export const UserModel: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export const WorkspaceModel: Model<IWorkspace> =
  mongoose.models.Workspace || mongoose.model<IWorkspace>('Workspace', WorkspaceSchema);

export const WorkspaceMemberModel: Model<IWorkspaceMember> =
  mongoose.models.WorkspaceMember ||
  mongoose.model<IWorkspaceMember>('WorkspaceMember', WorkspaceMemberSchema);

export const ProjectModel: Model<IProject> =
  mongoose.models.Project || mongoose.model<IProject>('Project', ProjectSchema);

export const TaskModel: Model<ITask> =
  mongoose.models.Task || mongoose.model<ITask>('Task', TaskSchema);

export const CommentModel: Model<IComment> =
  mongoose.models.Comment || mongoose.model<IComment>('Comment', CommentSchema);

export const ActivityModel: Model<IActivity> =
  mongoose.models.Activity || mongoose.model<IActivity>('Activity', ActivitySchema);

export const NotificationModel: Model<INotification> =
  mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);

export const LabelModel: Model<ILabel> =
  mongoose.models.Label || mongoose.model<ILabel>('Label', LabelSchema);
