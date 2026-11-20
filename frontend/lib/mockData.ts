import type {
  User, Workspace, WorkspaceMember, Project, KanbanColumn,
  Task, Comment, Activity, Notification, Label, AppSettings,
  TaskStatus, Priority,
} from '@/types';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}
function daysFromNow(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString();
}

// ─── Users ───────────────────────────────────────────────────────────────────

export const MOCK_USERS: User[] = [
  {
    id: 'user-1',
    name: 'Alex Johnson',
    email: 'alex@workspace.dev',
    avatarColor: '#6366f1',
    createdAt: daysAgo(90),
    updatedAt: daysAgo(5),
  },
  {
    id: 'user-2',
    name: 'Sarah Williams',
    email: 'sarah@workspace.dev',
    avatarColor: '#ec4899',
    createdAt: daysAgo(85),
    updatedAt: daysAgo(2),
  },
  {
    id: 'user-3',
    name: 'Michael Brown',
    email: 'michael@workspace.dev',
    avatarColor: '#f59e0b',
    createdAt: daysAgo(80),
    updatedAt: daysAgo(1),
  },
  {
    id: 'user-4',
    name: 'Emma Davis',
    email: 'emma@workspace.dev',
    avatarColor: '#10b981',
    createdAt: daysAgo(75),
    updatedAt: daysAgo(3),
  },
  {
    id: 'user-5',
    name: 'Daniel Wilson',
    email: 'daniel@workspace.dev',
    avatarColor: '#3b82f6',
    createdAt: daysAgo(70),
    updatedAt: daysAgo(7),
  },
];

// ─── Default Kanban Columns ──────────────────────────────────────────────────

export const DEFAULT_KANBAN_COLUMNS: KanbanColumn[] = [
  { id: 'col-backlog',     title: 'Backlog',      status: 'backlog',     order: 0, color: '#94a3b8' },
  { id: 'col-todo',        title: 'To Do',        status: 'todo',        order: 1, color: '#60a5fa' },
  { id: 'col-in-progress', title: 'In Progress',  status: 'in-progress', order: 2, color: '#a78bfa' },
  { id: 'col-review',      title: 'Review',       status: 'review',      order: 3, color: '#fb923c' },
  { id: 'col-done',        title: 'Done',         status: 'done',        order: 4, color: '#34d399' },
];

// ─── Workspaces ──────────────────────────────────────────────────────────────

export const MOCK_WORKSPACES: Workspace[] = [
  {
    id: 'ws-1',
    name: 'Acme Corp',
    description: 'Main product development workspace',
    icon: '🚀',
    color: '#6366f1',
    ownerId: 'user-1',
    defaultView: 'kanban',
    createdAt: daysAgo(90),
    updatedAt: daysAgo(1),
  },
  {
    id: 'ws-2',
    name: 'Personal Projects',
    description: 'My side projects and experiments',
    icon: '💡',
    color: '#10b981',
    ownerId: 'user-1',
    defaultView: 'list',
    createdAt: daysAgo(60),
    updatedAt: daysAgo(10),
  },
];

// ─── Workspace Members ───────────────────────────────────────────────────────

export const MOCK_WORKSPACE_MEMBERS: WorkspaceMember[] = [
  { id: 'wm-1', workspaceId: 'ws-1', userId: 'user-1', role: 'owner',  joinedAt: daysAgo(90) },
  { id: 'wm-2', workspaceId: 'ws-1', userId: 'user-2', role: 'admin',  joinedAt: daysAgo(85) },
  { id: 'wm-3', workspaceId: 'ws-1', userId: 'user-3', role: 'member', joinedAt: daysAgo(80) },
  { id: 'wm-4', workspaceId: 'ws-1', userId: 'user-4', role: 'member', joinedAt: daysAgo(75) },
  { id: 'wm-5', workspaceId: 'ws-1', userId: 'user-5', role: 'viewer', joinedAt: daysAgo(70) },
  { id: 'wm-6', workspaceId: 'ws-2', userId: 'user-1', role: 'owner',  joinedAt: daysAgo(60) },
  { id: 'wm-7', workspaceId: 'ws-2', userId: 'user-2', role: 'member', joinedAt: daysAgo(55) },
];

// ─── Labels ──────────────────────────────────────────────────────────────────

export const MOCK_LABELS: Label[] = [
  { id: 'label-1', workspaceId: 'ws-1', name: 'Bug',         color: '#ef4444' },
  { id: 'label-2', workspaceId: 'ws-1', name: 'Feature',     color: '#6366f1' },
  { id: 'label-3', workspaceId: 'ws-1', name: 'Improvement', color: '#f59e0b' },
  { id: 'label-4', workspaceId: 'ws-1', name: 'Design',      color: '#ec4899' },
  { id: 'label-5', workspaceId: 'ws-1', name: 'Backend',     color: '#10b981' },
  { id: 'label-6', workspaceId: 'ws-1', name: 'Frontend',    color: '#3b82f6' },
  { id: 'label-7', workspaceId: 'ws-1', name: 'Urgent',      color: '#dc2626' },
  { id: 'label-8', workspaceId: 'ws-2', name: 'Research',    color: '#7c3aed' },
  { id: 'label-9', workspaceId: 'ws-2', name: 'Experiment',  color: '#0891b2' },
];

// ─── Projects ────────────────────────────────────────────────────────────────

export const MOCK_PROJECTS: Project[] = [
  {
    id: 'proj-1',
    workspaceId: 'ws-1',
    name: 'Platform Redesign',
    description: 'Complete overhaul of the main product UI/UX',
    icon: '🎨',
    color: '#6366f1',
    status: 'active',
    defaultView: 'kanban',
    template: 'software-development',
    memberIds: ['user-1', 'user-2', 'user-3', 'user-4'],
    columns: DEFAULT_KANBAN_COLUMNS.map(c => ({ ...c, id: `proj1-${c.id}` })),
    createdBy: 'user-1',
    createdAt: daysAgo(60),
    updatedAt: daysAgo(1),
  },
  {
    id: 'proj-2',
    workspaceId: 'ws-1',
    name: 'Mobile App Launch',
    description: 'iOS and Android app development and launch campaign',
    icon: '📱',
    color: '#ec4899',
    status: 'active',
    defaultView: 'kanban',
    template: 'product-launch',
    memberIds: ['user-1', 'user-2', 'user-4', 'user-5'],
    columns: DEFAULT_KANBAN_COLUMNS.map(c => ({ ...c, id: `proj2-${c.id}` })),
    createdBy: 'user-2',
    createdAt: daysAgo(45),
    updatedAt: daysAgo(2),
  },
  {
    id: 'proj-3',
    workspaceId: 'ws-1',
    name: 'Q4 Marketing',
    description: 'Q4 marketing campaigns and growth initiatives',
    icon: '📈',
    color: '#f59e0b',
    status: 'active',
    defaultView: 'list',
    template: 'marketing-campaign',
    memberIds: ['user-1', 'user-3', 'user-5'],
    columns: DEFAULT_KANBAN_COLUMNS.map(c => ({ ...c, id: `proj3-${c.id}` })),
    createdBy: 'user-3',
    createdAt: daysAgo(30),
    updatedAt: daysAgo(5),
  },
  {
    id: 'proj-4',
    workspaceId: 'ws-2',
    name: 'Personal Blog',
    description: 'My personal tech blog and portfolio website',
    icon: '✍️',
    color: '#10b981',
    status: 'active',
    defaultView: 'list',
    template: 'website-project',
    memberIds: ['user-1', 'user-2'],
    columns: DEFAULT_KANBAN_COLUMNS.map(c => ({ ...c, id: `proj4-${c.id}` })),
    createdBy: 'user-1',
    createdAt: daysAgo(20),
    updatedAt: daysAgo(8),
  },
];

// ─── Tasks ───────────────────────────────────────────────────────────────────

function makeTask(
  id: string, projectId: string, workspaceId: string,
  title: string, status: TaskStatus, priority: Priority,
  assigneeId: string | undefined, labelIds: string[],
  daysUntilDue: number | null, order: number,
  createdBy: string, daysCreatedAgo: number,
  parentTaskId?: string, description?: string,
): Task {
  return {
    id, projectId, workspaceId, parentTaskId, title, description, status, priority,
    dueDate: daysUntilDue !== null ? daysFromNow(daysUntilDue) : undefined,
    assigneeId, labelIds, attachmentIds: [], order, createdBy,
    createdAt: daysAgo(daysCreatedAgo),
    updatedAt: daysAgo(Math.floor(daysCreatedAgo / 2)),
  };
}

export const MOCK_TASKS: Task[] = [
  // Project 1 — Platform Redesign
  makeTask('task-1',  'proj-1','ws-1','Define design system tokens',    'done',       'high',  'user-2',['label-4','label-6'],-5,  0,'user-1',50,undefined,'Establish color, typography, and spacing tokens.'),
  makeTask('task-2',  'proj-1','ws-1','Create component library',       'in-progress','high',  'user-2',['label-4','label-6'], 7,  1,'user-1',45,undefined,'Build reusable React components following the design system.'),
  makeTask('task-3',  'proj-1','ws-1','Redesign dashboard page',        'in-progress','urgent','user-4',['label-4'],           3,  2,'user-1',40),
  makeTask('task-4',  'proj-1','ws-1','Fix navigation bug on mobile',   'todo',       'high',  'user-3',['label-1','label-6'], 5,  3,'user-2',35),
  makeTask('task-5',  'proj-1','ws-1','Add dark mode support',          'todo',       'medium','user-3',['label-2','label-6'],14,  4,'user-1',30),
  makeTask('task-6',  'proj-1','ws-1','Accessibility audit',            'backlog',    'medium',undefined,['label-3'],          21,  5,'user-2',28),
  makeTask('task-7',  'proj-1','ws-1','Performance optimization',       'backlog',    'low',   undefined,['label-3','label-5'],30,  6,'user-1',25),
  makeTask('task-8',  'proj-1','ws-1','Update onboarding flow',         'review',     'high',  'user-4',['label-2'],           2,  7,'user-2',22),
  makeTask('task-9',  'proj-1','ws-1','Write API documentation',        'todo',       'medium','user-3',['label-5'],          10,  8,'user-1',20),
  makeTask('task-10', 'proj-1','ws-1','Set up CI/CD pipeline',          'done',       'high',  'user-1',['label-5'],          -3,  9,'user-1',55),
  // Subtasks for task-2
  makeTask('task-2-1','proj-1','ws-1','Button component',  'done',       'medium','user-2',['label-6'],-1,0,'user-1',43,'task-2'),
  makeTask('task-2-2','proj-1','ws-1','Input component',   'done',       'medium','user-2',['label-6'],-1,1,'user-1',42,'task-2'),
  makeTask('task-2-3','proj-1','ws-1','Modal component',   'in-progress','medium','user-2',['label-6'], 3,2,'user-1',40,'task-2'),
  makeTask('task-2-4','proj-1','ws-1','Dropdown component','todo',       'low',   'user-2',['label-6'], 7,3,'user-1',40,'task-2'),
  // Project 2 — Mobile App
  makeTask('task-11','proj-2','ws-1','App wireframes & mockups',     'done',       'urgent','user-4',['label-4'],          -10,0,'user-2',40),
  makeTask('task-12','proj-2','ws-1','Set up React Native project',  'done',       'high',  'user-1',['label-5'],           -8,1,'user-2',38),
  makeTask('task-13','proj-2','ws-1','Implement authentication',     'in-progress','urgent','user-1',['label-5','label-2'],  4,2,'user-2',35),
  makeTask('task-14','proj-2','ws-1','Push notifications setup',     'todo',       'high',  'user-3',['label-5','label-2'],  8,3,'user-1',30),
  makeTask('task-15','proj-2','ws-1','App Store submission',         'backlog',    'high',  'user-1',['label-2'],           25,4,'user-2',25),
  makeTask('task-16','proj-2','ws-1','Beta testing program',         'todo',       'medium','user-4',['label-3'],           15,5,'user-2',22),
  makeTask('task-17','proj-2','ws-1','Marketing landing page',       'in-progress','medium','user-4',['label-4','label-6'],  6,6,'user-2',20),
  makeTask('task-18','proj-2','ws-1','Crash reporting integration',  'review',     'high',  'user-1',['label-5','label-1'],  1,7,'user-1',18),
  // Project 3 — Marketing
  makeTask('task-19','proj-3','ws-1','Content calendar Q4',          'done',       'high',  'user-3',['label-3'],           -2,0,'user-3',28),
  makeTask('task-20','proj-3','ws-1','Social media campaigns',       'in-progress','high',  'user-3',['label-3'],            5,1,'user-3',25),
  makeTask('task-21','proj-3','ws-1','Email newsletter series',      'todo',       'medium','user-5',['label-2'],           10,2,'user-1',22),
  makeTask('task-22','proj-3','ws-1','SEO audit and improvements',   'todo',       'medium','user-3',['label-3'],           12,3,'user-3',20),
  makeTask('task-23','proj-3','ws-1','Influencer partnership plan',  'backlog',    'low',   undefined,['label-2'],          20,4,'user-1',18),
  makeTask('task-24','proj-3','ws-1','Paid ads strategy',            'review',     'urgent','user-5',['label-7'],            1,5,'user-3',15),
  // Project 4 — Personal Blog
  makeTask('task-25','proj-4','ws-2','Set up Next.js blog',          'done',       'high',  'user-1',['label-6'],           -5,0,'user-1',18),
  makeTask('task-26','proj-4','ws-2','Write first 5 articles',       'in-progress','medium','user-1',['label-8'],           14,1,'user-1',15),
  makeTask('task-27','proj-4','ws-2','Design blog layout',           'done',       'high',  'user-2',['label-4'],           -2,2,'user-1',17),
  makeTask('task-28','proj-4','ws-2','Set up analytics',             'todo',       'low',   'user-1',['label-9'],           21,3,'user-1',12),
  makeTask('task-29','proj-4','ws-2','Deploy to Vercel',             'todo',       'medium','user-1',['label-9'],            7,4,'user-1',10),
];

// ─── Comments ────────────────────────────────────────────────────────────────

export const MOCK_COMMENTS: Comment[] = [
  {
    id: 'comment-1', taskId: 'task-2', authorId: 'user-2',
    content: "I've finished the button and input components. Working on modal now. @[user-1:Alex Johnson] can you review the Storybook?",
    mentions: ['user-1'], createdAt: daysAgo(5), updatedAt: daysAgo(5),
  },
  {
    id: 'comment-2', taskId: 'task-2', authorId: 'user-1',
    content: "Looks great! The button variants are exactly what we needed. Let's sync tomorrow to go over the modal interactions.",
    mentions: [], createdAt: daysAgo(4), updatedAt: daysAgo(4),
  },
  {
    id: 'comment-3', taskId: 'task-3', authorId: 'user-4',
    content: 'Dashboard wireframes are ready for review. @[user-2:Sarah Williams] I\'d love your feedback on the data visualization section.',
    mentions: ['user-2'], createdAt: daysAgo(3), updatedAt: daysAgo(3),
  },
  {
    id: 'comment-4', taskId: 'task-3', authorId: 'user-2',
    content: 'The layout looks clean! I\'d suggest moving the quick stats to the top row for better visibility.',
    mentions: [], createdAt: daysAgo(2), updatedAt: daysAgo(2),
  },
  {
    id: 'comment-5', taskId: 'task-13', authorId: 'user-1',
    content: "Implementing JWT auth with refresh tokens. Should be done by Thursday. @[user-3:Michael Brown] we'll need the backend endpoints ready.",
    mentions: ['user-3'], createdAt: daysAgo(2), updatedAt: daysAgo(2),
  },
  {
    id: 'comment-6', taskId: 'task-4', authorId: 'user-3',
    content: 'Found the root cause — the hamburger menu z-index is conflicting with the modal overlay. Fix is straightforward.',
    mentions: [], createdAt: daysAgo(1), updatedAt: daysAgo(1),
  },
];

// ─── Activities ──────────────────────────────────────────────────────────────

export const MOCK_ACTIVITIES: Activity[] = [
  { id:'act-1', workspaceId:'ws-1', projectId:'proj-1', taskId:'task-1',  actorId:'user-2', action:'status_changed',  metadata:{ from:'review',       to:'done',        taskTitle:'Define design system tokens' },   createdAt: daysAgo(5) },
  { id:'act-2', workspaceId:'ws-1', projectId:'proj-1', taskId:'task-2',  actorId:'user-2', action:'comment_added',   metadata:{ commentId:'comment-1', taskTitle:'Create component library' },                      createdAt: daysAgo(5) },
  { id:'act-3', workspaceId:'ws-1', projectId:'proj-1', taskId:'task-3',  actorId:'user-4', action:'task_updated',    metadata:{ field:'status',        from:'todo',      to:'in-progress', taskTitle:'Redesign dashboard page' }, createdAt: daysAgo(4) },
  { id:'act-4', workspaceId:'ws-1', projectId:'proj-2', taskId:'task-13', actorId:'user-1', action:'assignee_changed',metadata:{ from:null,             to:'user-1',      taskTitle:'Implement authentication' },     createdAt: daysAgo(3) },
  { id:'act-5', workspaceId:'ws-1', projectId:'proj-1', taskId:'task-8',  actorId:'user-4', action:'status_changed',  metadata:{ from:'in-progress',    to:'review',      taskTitle:'Update onboarding flow' },       createdAt: daysAgo(2) },
  { id:'act-6', workspaceId:'ws-1', projectId:'proj-2', taskId:'task-18', actorId:'user-1', action:'status_changed',  metadata:{ from:'in-progress',    to:'review',      taskTitle:'Crash reporting integration' },  createdAt: daysAgo(1) },
  { id:'act-7', workspaceId:'ws-1', projectId:'proj-3', taskId:'task-24', actorId:'user-3', action:'priority_changed',metadata:{ from:'high',           to:'urgent',      taskTitle:'Paid ads strategy' },            createdAt: daysAgo(1) },
];

// ─── Notifications ───────────────────────────────────────────────────────────

export const MOCK_NOTIFICATIONS: Notification[] = [
  { id:'notif-1', userId:'user-1', type:'task_assigned',      title:'New Task Assigned',      message:'Sarah Williams assigned you to "Crash reporting integration"', taskId:'task-18', projectId:'proj-2', workspaceId:'ws-1', read:false, createdAt:daysAgo(1) },
  { id:'notif-2', userId:'user-1', type:'task_mentioned',     title:'You were mentioned',     message:'Emma Davis mentioned you in "Redesign dashboard page"',         taskId:'task-3',  projectId:'proj-1', workspaceId:'ws-1', read:false, createdAt:daysAgo(2) },
  { id:'notif-3', userId:'user-1', type:'due_date_approaching',title:'Due Date Approaching',  message:'"Redesign dashboard page" is due in 3 days',                    taskId:'task-3',  projectId:'proj-1', workspaceId:'ws-1', read:false, createdAt:daysAgo(0) },
  { id:'notif-4', userId:'user-1', type:'comment_added',       title:'New Comment',           message:'Michael Brown commented on "Fix navigation bug on mobile"',     taskId:'task-4',  projectId:'proj-1', workspaceId:'ws-1', read:true,  createdAt:daysAgo(1) },
  { id:'notif-5', userId:'user-1', type:'task_mentioned',     title:'You were mentioned',     message:'Michael Brown mentioned you in "Implement authentication"',      taskId:'task-13', projectId:'proj-2', workspaceId:'ws-1', read:true,  createdAt:daysAgo(2) },
];

// ─── Default App Settings ────────────────────────────────────────────────────

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  defaultView: 'kanban',
  compactMode: false,
  notificationPreferences: {
    taskAssignments: true,
    mentions: true,
    dueDateApproaching: true,
    commentAdded: true,
  },
  language: 'en',
};

// ─── Mock Credentials ────────────────────────────────────────────────────────

export const MOCK_CREDENTIALS: Record<string, string> = {
  'alex@workspace.dev':    'password123',
  'sarah@workspace.dev':   'password123',
  'michael@workspace.dev': 'password123',
  'emma@workspace.dev':    'password123',
  'daniel@workspace.dev':  'password123',
};
